import { SetMetadata } from '@nestjs/common';
import { RoleName } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Uso: @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
 * Combinado com o RolesGuard para restringir rotas por papel (RBAC).
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
