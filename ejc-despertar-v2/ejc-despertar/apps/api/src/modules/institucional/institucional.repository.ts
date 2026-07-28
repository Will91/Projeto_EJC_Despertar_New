import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class InstitucionalRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ----- Notícias -----
  createNoticia(data: Prisma.NoticiaCreateInput) {
    return this.prisma.noticia.create({ data });
  }
  findNoticiaById(id: string) {
    return this.prisma.noticia.findUnique({ where: { id } });
  }
  findNoticiaBySlug(slug: string) {
    return this.prisma.noticia.findUnique({ where: { slug } });
  }
  findNoticiasPublicadas() {
    return this.prisma.noticia.findMany({
      where: { status: 'PUBLICADO' },
      orderBy: { publicadoEm: 'desc' },
    });
  }
  findTodasNoticias() {
    return this.prisma.noticia.findMany({ orderBy: { createdAt: 'desc' } });
  }
  updateNoticia(id: string, data: Prisma.NoticiaUpdateInput) {
    return this.prisma.noticia.update({ where: { id }, data });
  }
  deleteNoticia(id: string) {
    return this.prisma.noticia.delete({ where: { id } });
  }

  // ----- Álbuns / Fotos -----
  createAlbum(data: Prisma.AlbumCreateInput) {
    return this.prisma.album.create({ data });
  }
  findAlbuns() {
    return this.prisma.album.findMany({ include: { fotos: true }, orderBy: { createdAt: 'desc' } });
  }
  addFoto(data: Prisma.FotoCreateInput) {
    return this.prisma.foto.create({ data });
  }

  // ----- Agenda -----
  createAgendaEvento(data: Prisma.AgendaEventoCreateInput) {
    return this.prisma.agendaEvento.create({ data });
  }
  findAgendaEventos() {
    return this.prisma.agendaEvento.findMany({ orderBy: { dataInicio: 'asc' } });
  }

  // ----- Slides -----
  createSlide(data: Prisma.SlideCreateInput) {
    return this.prisma.slide.create({ data });
  }
  findSlidesAtivos() {
    return this.prisma.slide.findMany({ where: { ativo: true }, orderBy: { ordem: 'asc' } });
  }

  // ----- Contato -----
  createContato(data: Prisma.ContatoCreateInput) {
    return this.prisma.contato.create({ data });
  }
  findContatos(lido?: boolean) {
    return this.prisma.contato.findMany({
      where: lido === undefined ? {} : { lido },
      orderBy: { createdAt: 'desc' },
    });
  }
  marcarContatoLido(id: string) {
    return this.prisma.contato.update({ where: { id }, data: { lido: true } });
  }
}
