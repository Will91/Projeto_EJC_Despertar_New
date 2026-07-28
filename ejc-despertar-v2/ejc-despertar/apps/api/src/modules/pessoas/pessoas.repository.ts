import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

/**
 * Repository isola toda query Prisma da camada de service.
 * Se um dia trocarmos de ORM, só este arquivo muda.
 */
@Injectable()
export class PessoasRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PessoaCreateInput) {
    return this.prisma.pessoa.create({ data, include: { equipe: true } });
  }

  findById(id: string) {
    return this.prisma.pessoa.findUnique({
      where: { id },
      include: {
        equipe: true,
        inscricoes: { include: { encontro: true, circulo: true } },
      },
    });
  }

  findMany(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 20, search } = params;
    const where: Prisma.PessoaWhereInput = search
      ? {
          OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { sobrenome: { contains: search, mode: 'insensitive' } },
            { apelido: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return this.prisma.$transaction([
      this.prisma.pessoa.findMany({
        where,
        skip,
        take,
        orderBy: { nome: 'asc' },
        include: { equipe: true },
      }),
      this.prisma.pessoa.count({ where }),
    ]);
  }

  update(id: string, data: Prisma.PessoaUpdateInput) {
    return this.prisma.pessoa.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.pessoa.delete({ where: { id } });
  }
}
