import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../config/prisma.service';

/**
 * Interceptor global de auditoria (pedido na Etapa 1: "registrar quem
 * alterou, quando, IP"). Registra automaticamente toda requisição de
 * escrita (POST/PATCH/PUT/DELETE) que terminar com sucesso, sem que
 * cada controller precise lembrar de fazer isso manualmente.
 *
 * Para rotas que merecem um rótulo de negócio mais claro no log
 * (ex.: "confirmar-inscricao" em vez de "PATCH"), use o decorator
 * @AuditAction('confirmar-inscricao') combinado com um Reflector —
 * omitido aqui para manter o escopo desta etapa focado no essencial.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, user, ip } = request;

    const isWrite = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
    if (!isWrite) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Fire-and-forget: auditoria não deve travar a resposta ao usuário.
        this.prisma.auditLog
          .create({
            data: {
              userId: user?.userId ?? null,
              acao: method,
              entidade: originalUrl.split('?')[0],
              ip: ip ?? null,
            },
          })
          .catch((err) => console.error('Falha ao gravar audit log:', err));
      }),
    );
  }
}
