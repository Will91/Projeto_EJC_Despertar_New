import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ComunicacaoService } from './comunicacao.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Comunicação')
@Controller('comunicacao')
export class ComunicacaoController {
  constructor(private readonly service: ComunicacaoService) {}

  // ----- Mural / Avisos (qualquer usuário autenticado pode ler) -----
  @Post('avisos')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  createAviso(@Body() dto: CreateAvisoDto) {
    return this.service.createAviso(dto);
  }

  @Get('avisos')
  findAvisos() {
    return this.service.findAvisos();
  }

  @Delete('avisos/:id')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  removeAviso(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeAviso(id);
  }

  // ----- Notificações -----
  @Post('notificacoes')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  createNotificacao(@Body() dto: CreateNotificacaoDto) {
    return this.service.createNotificacao(dto);
  }

  @Get('notificacoes/minhas')
  findMinhasNotificacoes(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findMinhasNotificacoes(user.userId);
  }

  @Patch('notificacoes/:id/lida')
  marcarLida(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.marcarLida(id);
  }
}
