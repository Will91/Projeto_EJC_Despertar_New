import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleName, StatusConfirmacao } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCasalDto } from './dto/create-casal.dto';
import { CreateCirculoDto } from './dto/create-circulo.dto';
import { CreateEncontroDto } from './dto/create-encontro.dto';
import { CreateInscricaoDto } from './dto/create-inscricao.dto';
import { UpdateEncontroDto } from './dto/update-encontro.dto';
import { EncontrosService } from './encontros.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Encontros')
@Controller('encontros')
export class EncontrosController {
  constructor(private readonly encontrosService: EncontrosService) {}

  // ----- Encontro -----

  @Post()
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  createEncontro(@Body() dto: CreateEncontroDto) {
    return this.encontrosService.createEncontro(dto);
  }

  @Get('ativo')
  @Public() // consultado pela tela pública de inscrição, antes do login
  findEncontroAtivo() {
    return this.encontrosService.findEncontroAtivo();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  findEncontroById(@Param('id', ParseUUIDPipe) id: string) {
    return this.encontrosService.findEncontroById(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  updateEncontro(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEncontroDto) {
    return this.encontrosService.updateEncontro(id, dto);
  }

  @Patch(':id/finalizar')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  finalizarEncontro(@Param('id', ParseUUIDPipe) id: string) {
    return this.encontrosService.finalizarEncontro(id);
  }

  @Get(':id/dashboard')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  dashboard(@Param('id', ParseUUIDPipe) id: string) {
    return this.encontrosService.dashboard(id);
  }

  // ----- Círculos -----

  @Post('circulos')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  createCirculo(@Body() dto: CreateCirculoDto) {
    return this.encontrosService.createCirculo(dto);
  }

  @Get(':id/circulos')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  findCirculos(@Param('id', ParseUUIDPipe) id: string) {
    return this.encontrosService.findCirculosByEncontro(id);
  }

  // ----- Casais -----

  @Post('casais')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  createCasal(@Body() dto: CreateCasalDto) {
    return this.encontrosService.createCasal(dto);
  }

  @Get(':id/casais')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  findCasais(@Param('id', ParseUUIDPipe) id: string) {
    return this.encontrosService.findCasaisByEncontro(id);
  }

  @Patch('casais/:casalId/circulo/:circuloId')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  vincularCasalACirculo(
    @Param('casalId', ParseUUIDPipe) casalId: string,
    @Param('circuloId', ParseUUIDPipe) circuloId: string,
  ) {
    return this.encontrosService.vincularCasalACirculo(casalId, circuloId);
  }

  // ----- Inscrições -----

  @Post('inscricoes')
  @Public() // ficha de inscrição é preenchida antes de o encontrista ter conta
  createInscricao(@Body() dto: CreateInscricaoDto) {
    return this.encontrosService.createInscricao(dto);
  }

  @Get(':id/inscricoes')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  findInscricoes(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status?: StatusConfirmacao,
  ) {
    return this.encontrosService.findInscricoesByEncontro(id, status);
  }

  @Get('inscricoes/:inscricaoId')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  findInscricaoById(@Param('inscricaoId', ParseUUIDPipe) inscricaoId: string) {
    return this.encontrosService.findInscricaoById(inscricaoId);
  }

  @Patch('inscricoes/:inscricaoId/confirmar')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  confirmarInscricao(@Param('inscricaoId', ParseUUIDPipe) inscricaoId: string) {
    return this.encontrosService.confirmarInscricao(inscricaoId);
  }

  @Patch('inscricoes/:inscricaoId/etapa/:etapa')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.EQUIPE)
  registrarEtapa(
    @Param('inscricaoId', ParseUUIDPipe) inscricaoId: string,
    @Param('etapa') etapa: 'primeiroDia' | 'segundoDia' | 'cartas',
  ) {
    return this.encontrosService.registrarEtapa(inscricaoId, etapa);
  }

  @Patch('inscricoes/:inscricaoId/casal/:casalId')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  atrelarCasal(
    @Param('inscricaoId', ParseUUIDPipe) inscricaoId: string,
    @Param('casalId', ParseUUIDPipe) casalId: string,
  ) {
    return this.encontrosService.atrelarCasal(inscricaoId, casalId);
  }

  @Post('check-in/:qrCodeToken')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.EQUIPE)
  registrarCheckIn(
    @Param('qrCodeToken') qrCodeToken: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.encontrosService.registrarCheckIn(qrCodeToken, user.userId);
  }
}
