import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './config/prisma.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { IamModule } from './modules/iam/iam.module';
import { PessoasModule } from './modules/pessoas/pessoas.module';
import { EncontrosModule } from './modules/encontros/encontros.module';
import { InstitucionalModule } from './modules/institucional/institucional.module';
import { ComunicacaoModule } from './modules/comunicacao/comunicacao.module';
import { BibliotecaModule } from './modules/biblioteca/biblioteca.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { FormacoesModule } from './modules/formacoes/formacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    EmailModule,
    IamModule,
    PessoasModule,
    EncontrosModule,
    InstitucionalModule,
    ComunicacaoModule,
    BibliotecaModule,
    FinanceiroModule,
    AdminModule,
    UploadsModule,
    FormacoesModule,
  ],
  providers: [
    // Ordem importa: throttler -> autenticação (JWT) -> autorização (RBAC).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
