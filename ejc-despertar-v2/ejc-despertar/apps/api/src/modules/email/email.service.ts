import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Abstração de envio de e-mail via SMTP — funciona com qualquer
 * provedor (Resend, SendGrid, SES, Gmail SMTP, Mailtrap em dev),
 * sem prender o projeto a um vendor específico. Basta preencher
 * SMTP_HOST/PORT/USER/PASS no .env.
 *
 * Se as variáveis de SMTP não estiverem configuradas (ex.: ambiente
 * de desenvolvimento local), o serviço cai em modo "dry run" e só
 * loga o conteúdo no console — assim o fluxo inteiro (gerar token,
 * validar, expirar) pode ser testado sem precisar de um SMTP real.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT') ?? 587,
        secure: this.config.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP não configurado — e-mail NÃO enviado de verdade (dry run).\nPara: ${to}\nAssunto: ${subject}\n${html}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM') ?? 'nao-responda@ejcdespertar.org.br',
      to,
      subject,
      html,
    });
  }

  sendConfirmacaoEmail(to: string, linkConfirmacao: string) {
    return this.send({
      to,
      subject: 'Confirme seu e-mail — EJC Despertar',
      html: `
        <p>Olá! Confirme seu e-mail para ativar sua conta no portal do Despertar:</p>
        <p><a href="${linkConfirmacao}">${linkConfirmacao}</a></p>
        <p>Se você não fez esse cadastro, pode ignorar esta mensagem.</p>
      `,
    });
  }

  sendRecuperacaoSenha(to: string, linkRedefinicao: string) {
    return this.send({
      to,
      subject: 'Redefinição de senha — EJC Despertar',
      html: `
        <p>Recebemos um pedido para redefinir sua senha.</p>
        <p><a href="${linkRedefinicao}">${linkRedefinicao}</a></p>
        <p>Este link expira em 1 hora. Se você não pediu isso, pode ignorar esta mensagem com segurança.</p>
      `,
    });
  }
}
