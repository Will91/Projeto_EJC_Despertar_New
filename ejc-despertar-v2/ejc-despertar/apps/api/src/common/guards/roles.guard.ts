import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard de autorização (RBAC). Roda depois do JwtAuthGuard e verifica
 * se o usuário autenticado possui algum dos papéis exigidos pela rota.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasRole = user?.roles?.some((role: string) => requiredRoles.includes(role as RoleName));

    if (!hasRole) {
      throw new ForbiddenException('Você não tem permissão para executar esta ação.');
    }
    return true;
  }
}
