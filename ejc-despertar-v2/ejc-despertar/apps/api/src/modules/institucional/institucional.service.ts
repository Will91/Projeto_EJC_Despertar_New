import { Injectable, NotFoundException } from '@nestjs/common';
import { AddFotoDto } from './dto/add-foto.dto';
import { CreateAgendaEventoDto } from './dto/create-agenda-evento.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { CreateContatoDto } from './dto/create-contato.dto';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { InstitucionalRepository } from './institucional.repository';

function slugify(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

@Injectable()
export class InstitucionalService {
  constructor(private readonly repository: InstitucionalRepository) {}

  // ----- Notícias -----
  async createNoticia(dto: CreateNoticiaDto) {
    const baseSlug = slugify(dto.titulo);
    let slug = baseSlug;
    let sufixo = 1;
    // garante slug único mesmo com títulos repetidos
    while (await this.repository.findNoticiaBySlug(slug)) {
      slug = `${baseSlug}-${++sufixo}`;
    }
    return this.repository.createNoticia({ ...dto, slug });
  }

  async findNoticiaById(id: string) {
    const noticia = await this.repository.findNoticiaById(id);
    if (!noticia) throw new NotFoundException('Notícia não encontrada.');
    return noticia;
  }

  findNoticiasPublicadas() {
    return this.repository.findNoticiasPublicadas();
  }

  findTodasNoticias() {
    return this.repository.findTodasNoticias();
  }

  async updateNoticia(id: string, dto: UpdateNoticiaDto) {
    await this.findNoticiaById(id);
    return this.repository.updateNoticia(id, dto);
  }

  async publicarNoticia(id: string) {
    await this.findNoticiaById(id);
    return this.repository.updateNoticia(id, { status: 'PUBLICADO', publicadoEm: new Date() });
  }

  async removeNoticia(id: string) {
    await this.findNoticiaById(id);
    await this.repository.deleteNoticia(id);
  }

  // ----- Álbuns / Fotos -----
  createAlbum(dto: CreateAlbumDto) {
    return this.repository.createAlbum(dto);
  }
  findAlbuns() {
    return this.repository.findAlbuns();
  }
  addFoto(dto: AddFotoDto) {
    return this.repository.addFoto({
      url: dto.url,
      legenda: dto.legenda,
      album: { connect: { id: dto.albumId } },
    });
  }

  // ----- Agenda -----
  createAgendaEvento(dto: CreateAgendaEventoDto) {
    return this.repository.createAgendaEvento(dto);
  }
  findAgendaEventos() {
    return this.repository.findAgendaEventos();
  }

  // ----- Slides -----
  createSlide(dto: CreateSlideDto) {
    return this.repository.createSlide({ ...dto, ordem: dto.ordem ?? 0 });
  }
  findSlidesAtivos() {
    return this.repository.findSlidesAtivos();
  }

  // ----- Contato -----
  createContato(dto: CreateContatoDto) {
    return this.repository.createContato(dto);
  }
  findContatos(lido?: boolean) {
    return this.repository.findContatos(lido);
  }
  marcarContatoLido(id: string) {
    return this.repository.marcarContatoLido(id);
  }
}
