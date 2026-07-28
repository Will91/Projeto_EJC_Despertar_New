import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AddFotoDto } from './dto/add-foto.dto';
import { CreateAgendaEventoDto } from './dto/create-agenda-evento.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { CreateContatoDto } from './dto/create-contato.dto';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { InstitucionalService } from './institucional.service';
import { ApiTags } from '@nestjs/swagger';

/**
 * Este módulo substitui o WordPress (decisão da Etapa 2). As rotas
 * @Public() abaixo são as que alimentam o site institucional público
 * em Next.js (SSR/ISR); as demais exigem login administrativo.
 */
@ApiTags('Institucional')
@Controller('institucional')
export class InstitucionalController {
  constructor(private readonly service: InstitucionalService) {}

  // ----- Notícias -----
  @Post('noticias')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  createNoticia(@Body() dto: CreateNoticiaDto) {
    return this.service.createNoticia(dto);
  }

  @Get('noticias/publicadas')
  @Public()
  findNoticiasPublicadas() {
    return this.service.findNoticiasPublicadas();
  }

  @Get('noticias')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  findTodasNoticias() {
    return this.service.findTodasNoticias();
  }

  @Patch('noticias/:id')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  updateNoticia(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNoticiaDto) {
    return this.service.updateNoticia(id, dto);
  }

  @Patch('noticias/:id/publicar')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  publicarNoticia(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.publicarNoticia(id);
  }

  // ----- Álbuns / Fotos -----
  @Post('albuns')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  createAlbum(@Body() dto: CreateAlbumDto) {
    return this.service.createAlbum(dto);
  }

  @Get('albuns')
  @Public()
  findAlbuns() {
    return this.service.findAlbuns();
  }

  @Post('fotos')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  addFoto(@Body() dto: AddFotoDto) {
    return this.service.addFoto(dto);
  }

  // ----- Agenda -----
  @Post('agenda')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  createAgendaEvento(@Body() dto: CreateAgendaEventoDto) {
    return this.service.createAgendaEvento(dto);
  }

  @Get('agenda')
  @Public()
  findAgendaEventos() {
    return this.service.findAgendaEventos();
  }

  // ----- Slides -----
  @Post('slides')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  createSlide(@Body() dto: CreateSlideDto) {
    return this.service.createSlide(dto);
  }

  @Get('slides')
  @Public()
  findSlidesAtivos() {
    return this.service.findSlidesAtivos();
  }

  // ----- Contato -----
  @Post('contato')
  @Public()
  createContato(@Body() dto: CreateContatoDto) {
    return this.service.createContato(dto);
  }

  @Get('contato')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  findContatos(@Query('lido') lido?: string) {
    return this.service.findContatos(lido === undefined ? undefined : lido === 'true');
  }

  @Patch('contato/:id/lido')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  marcarContatoLido(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.marcarContatoLido(id);
  }
}
