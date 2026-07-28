import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  countPessoas() {
    return this.prisma.pessoa.count();
  }

  countUsersAtivos() {
    return this.prisma.user.count({ where: { isActive: true } });
  }

  findAuditLogs(params: { entidade?: string; skip?: number; take?: number }) {
    const { entidade, skip = 0, take = 50 } = params;
    return this.prisma.auditLog.findMany({
      where: entidade ? { entidade: { contains: entidade } } : {},
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /** Dados brutos para exportação (PDF/Excel) da lista de inscritos de um encontro. */
  findInscritosParaExportacao(encontroId: string) {
    return this.prisma.inscricao.findMany({
      where: { encontroId },
      include: { pessoa: true, circulo: true },
      orderBy: { pessoa: { nome: 'asc' } },
    });
  }
}
