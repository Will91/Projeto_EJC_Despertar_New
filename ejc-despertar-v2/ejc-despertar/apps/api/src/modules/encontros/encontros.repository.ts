import { Injectable } from '@nestjs/common';
import { Prisma, StatusConfirmacao } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class EncontrosRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ----- Encontro -----
  createEncontro(data: Prisma.EncontroCreateInput) {
    return this.prisma.encontro.create({ data });
  }

  findEncontroAtivo() {
    return this.prisma.encontro.findFirst({
      where: { status: { in: ['INSCRICOES_ABERTAS', 'EM_ANDAMENTO'] } },
      include: { circulos: true },
    });
  }

  findEncontroById(id: string) {
    return this.prisma.encontro.findUnique({
      where: { id },
      include: { circulos: true, casais: true },
    });
  }

  updateEncontro(id: string, data: Prisma.EncontroUpdateInput) {
    return this.prisma.encontro.update({ where: { id }, data });
  }

  // ----- Circulo -----
  createCirculo(data: Prisma.CirculoCreateInput) {
    return this.prisma.circulo.create({ data });
  }

  findCirculosByEncontro(encontroId: string) {
    return this.prisma.circulo.findMany({
      where: { encontroId },
      include: { _count: { select: { inscricoes: true } } },
    });
  }

  // ----- Casal -----
  createCasal(data: Prisma.CasalCreateInput) {
    return this.prisma.casal.create({
      data,
      include: { primeiroComponente: true, segundoComponente: true },
    });
  }

  findCasaisByEncontro(encontroId: string) {
    return this.prisma.casal.findMany({
      where: { encontroId },
      include: { primeiroComponente: true, segundoComponente: true, circulos: true },
    });
  }

  vincularCasalACirculo(casalId: string, circuloId: string) {
    return this.prisma.circulo.update({ where: { id: circuloId }, data: { casalId } });
  }

  // ----- Inscricao -----
  createInscricao(data: Prisma.InscricaoCreateInput) {
    return this.prisma.inscricao.create({
      data,
      include: { pessoa: true, encontro: true, circulo: true },
    });
  }

  findInscricaoById(id: string) {
    return this.prisma.inscricao.findUnique({
      where: { id },
      include: { pessoa: true, encontro: true, circulo: true, casal: true },
    });
  }

  findInscricaoByQrToken(qrCodeToken: string) {
    return this.prisma.inscricao.findUnique({
      where: { qrCodeToken },
      include: { pessoa: true, encontro: true },
    });
  }

  findInscricoesByEncontro(encontroId: string, status?: StatusConfirmacao) {
    return this.prisma.inscricao.findMany({
      where: { encontroId, ...(status ? { status } : {}) },
      include: { pessoa: true, circulo: true },
      orderBy: { pessoa: { nome: 'asc' } },
    });
  }

  updateInscricao(id: string, data: Prisma.InscricaoUpdateInput) {
    return this.prisma.inscricao.update({ where: { id }, data });
  }

  countInscricoesPorStatus(encontroId: string) {
    return this.prisma.inscricao.groupBy({
      by: ['status'],
      where: { encontroId },
      _count: true,
    });
  }

  createCheckIn(inscricaoId: string, registradoPorId?: string) {
    return this.prisma.checkIn.create({ data: { inscricaoId, registradoPorId } });
  }
}
