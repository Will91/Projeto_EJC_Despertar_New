import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateFichaFormacaoDto } from './dto/create-ficha-formacao.dto';
import { FormacoesService } from './formacoes.service';

/**
 * Ficha de inscrição para formações, voltada a quem JÁ trabalha
 * no encontro (equipeiros) — pedida separadamente da Ficha do
 * Encontrista (módulo `encontros`), por ser um público diferente.
 */
@ApiTags('Formações')
@Controller('formacoes')
export class FormacoesController {
  constructor(private readonly service: FormacoesService) {}

  @Post()
  @Public() // ficha pública, preenchida pelo próprio equipeiro
  create(@Body() dto: CreateFichaFormacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  findMany() {
    return this.service.findMany();
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
