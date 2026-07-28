import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service'; // Ajuste o caminho se necessário
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto'; // Ajuste os imports dos seus DTOs

// A palavra-chave 'export' aqui resolve o erro TS4053
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    // Lógica do seu cadastro de usuário...
    // Exemplo genérico:
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('E-mail já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenPair> {
    // Lógica para validar refresh token e reemitir o par de tokens
    // Exemplo:
    try {
      const payload = this.jwtService.verify(dto.refreshToken);
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }

  private async generateTokens(userId: string, email: string): Promise<TokenPair> {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
