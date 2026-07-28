import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class FinanceiroRepository {
  constructor(private readonly prisma: PrismaService) {}

  createCategoria(data: Prisma.CategoriaFinanceiraCreateInput) {
    return this.prisma.categoriaFinanceira.create({ data });
  }
  findCategorias() {
    return this.prisma.categoriaFinanceira.findMany({ orderBy: { nome: 'asc' } });
  }

  createTransacao(data: Prisma.TransacaoCreateInput) {
    return this.prisma.transacao.create({ data, include: { categoria: true, encontro: true } });
  }

  findTransacoes(params: { encontroId?: string; skip?: number; take?: number }) {
    const { encontroId, skip = 0, take = 50 } = params;
    return this.prisma.transacao.findMany({
      where: encontroId ? { encontroId } : {},
      include: { categoria: true },
      orderBy: { data: 'desc' },
      skip,
      take,
    });
  }

  async somaPorTipo(encontroId?: string) {
    const where: Prisma.TransacaoWhereInput = encontroId ? { encontroId } : {};
    const [entradas, saidas] = await Promise.all([
      this.prisma.transacao.aggregate({
        where: { ...where, tipo: 'ENTRADA' },
        _sum: { valorCentavos: true },
      }),
      this.prisma.transacao.aggregate({
        where: { ...where, tipo: 'SAIDA' },
        _sum: { valorCentavos: true },
      }),
    ]);
    return {
      entradasCentavos: entradas._sum.valorCentavos ?? 0,
      saidasCentavos: saidas._sum.valorCentavos ?? 0,
    };
  }

  deleteTransacao(id: string) {
    return this.prisma.transacao.delete({ where: { id } });
  }
}
