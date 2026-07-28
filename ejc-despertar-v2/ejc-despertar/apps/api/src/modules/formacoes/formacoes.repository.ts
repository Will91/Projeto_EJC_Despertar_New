import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class FormacoesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.FichaFormacaoCreateInput) {
    return this.prisma.fichaFormacao.create({ data });
  }

  findMany() {
    return this.prisma.fichaFormacao.findMany({ orderBy: { createdAt: 'desc' } });
  }

  delete(id: string) {
    return this.prisma.fichaFormacao.delete({ where: { id } });
  }
}
