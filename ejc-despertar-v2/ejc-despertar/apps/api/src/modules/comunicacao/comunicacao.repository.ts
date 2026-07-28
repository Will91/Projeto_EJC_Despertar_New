import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ComunicacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  createAviso(data: Prisma.AvisoCreateInput) {
    return this.prisma.aviso.create({ data });
  }
  findAvisos() {
    return this.prisma.aviso.findMany({ orderBy: [{ fixado: 'desc' }, { createdAt: 'desc' }] });
  }
  deleteAviso(id: string) {
    return this.prisma.aviso.delete({ where: { id } });
  }

  createNotificacao(data: Prisma.NotificacaoCreateInput) {
    return this.prisma.notificacao.create({ data });
  }
  findNotificacoesByUser(userId: string) {
    return this.prisma.notificacao.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  marcarNotificacaoLida(id: string) {
    return this.prisma.notificacao.update({ where: { id }, data: { lida: true } });
  }
}
