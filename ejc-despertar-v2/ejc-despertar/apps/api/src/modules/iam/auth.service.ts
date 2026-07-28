import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../config/prisma.service';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const REFRESH_TOKEN_BYTES = 64;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Cadastro público. Todo novo usuário nasce com o papel ENCONTRISTA;
   * papéis administrativos (Secretaria, Coordenação, Tesouraria) só
   * podem ser concedidos por um Admin já autenticado, nunca no
   * próprio registro — isso fecha a brecha de "qualquer um vira
   * admin" que o sistema legado não tinha como prevenir.
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Já existe uma conta com este e-mail.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const pessoa = await this.prisma.pessoa.create({
      data: {
        nome: dto.nome,
        sobrenome: dto.sobrenome,
        // dataNascimento é obrigatória no schema; o cadastro público
        // simplificado pede o restante do perfil em uma segunda etapa
        // (tela "Cadastro do Encontrista" da Etapa 3).
        dataNascimento: new Date('2000-01-01'),
        email: dto.email,
      },
    });

    const encontristaRole = await this.prisma.role.findUniqueOrThrow({
      where: { name: RoleName.ENCONTRISTA },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        pessoaId: pessoa.id,
        roles: { create: [{ roleId: encontristaRole.id }] },
      },
      include: { roles: { include: { role: true } } },
    });

    await this.enviarEmailDeConfirmacao(user.id, user.email);

    return this.issueTokens(user.id, user.email, user.roles.map((r) => r.role.name));
  }

  private async enviarEmailDeConfirmacao(userId: string, email: string) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        tokenHash: this.hashToken(rawToken),
        userId,
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });
    const link = `${this.config.get<string>('FRONTEND_URL')}/verificar-email?token=${rawToken}`;
    await this.emailService.sendConfirmacaoEmail(email, link);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const record = await this.consumirToken(dto.token, 'EMAIL_VERIFICATION');
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Não revela se o e-mail existe ou não — mesma lógica do login.
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        tokenHash: this.hashToken(rawToken),
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
      },
    });
    const link = `${this.config.get<string>('FRONTEND_URL')}/redefinir-senha?token=${rawToken}`;
    await this.emailService.sendRecuperacaoSenha(user.email, link);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const record = await this.consumirToken(dto.token, 'PASSWORD_RESET');
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    // Por segurança, todas as sessões antigas são revogadas ao trocar a senha.
    await this.prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Valida, marca como usado e devolve um token de verificação/redefinição. */
  private async consumirToken(rawToken: string, purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.prisma.verificationToken.findUnique({ where: { tokenHash } });

    if (!record || record.purpose !== purpose || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Link inválido ou expirado. Solicite um novo.');
    }

    await this.prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return record;
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: { include: { role: true } } },
    });

    // Mensagem intencionalmente genérica: não revela se o e-mail existe
    // ou não (o login.php legado também não revelava, e mantemos isso).
    const invalidCredentials = () =>
      new UnauthorizedException('E-mail ou senha inválidos.');

    if (!user || !user.isActive) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    return this.issueTokens(user.id, user.email, user.roles.map((r) => r.role.name));
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    // Rotação: o refresh token usado é revogado e um novo par é emitido.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(
      stored.user.id,
      stored.user.email,
      stored.user.roles.map((r) => r.role.name),
    );
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string, email: string, roles: RoleName[]): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, roles },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
      },
    );

    const rawRefreshToken = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const refreshExpiresInMs = this.parseExpiryToMs(
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN')!,
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(rawRefreshToken),
        userId,
        expiresAt: new Date(Date.now() + refreshExpiresInMs),
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  /** Nunca guardamos o refresh token em texto puro no banco — só o hash. */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiryToMs(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) return 30 * 24 * 60 * 60 * 1000; // fallback: 30 dias
    const amount = Number(match[1]);
    const unit = match[2];
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
    return amount * unitMs;
  }
}
