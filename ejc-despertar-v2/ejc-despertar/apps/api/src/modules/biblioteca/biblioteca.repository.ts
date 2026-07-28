import { Injectable } from '@nestjs/common';
import { Prisma, TipoRecurso } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class BibliotecaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.RecursoBibliotecaCreateInput) {
    return this.prisma.recursoBiblioteca.create({ data });
  }

  findMany(tipo?: TipoRecurso) {
    return this.prisma.recursoBiblioteca.findMany({
      where: tipo ? { tipo } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  delete(id: string) {
    return this.prisma.recursoBiblioteca.delete({ where: { id } });
  }
}
