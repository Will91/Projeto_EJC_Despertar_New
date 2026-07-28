import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { FinanceiroService } from './financeiro.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Financeiro')
@Controller('financeiro')
@Roles(RoleName.ADMIN, RoleName.TESOURARIA, RoleName.COORDENACAO)
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Post('categorias')
  createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.service.createCategoria(dto);
  }

  @Get('categorias')
  findCategorias() {
    return this.service.findCategorias();
  }

  @Post('transacoes')
  createTransacao(@Body() dto: CreateTransacaoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createTransacao(dto, user);
  }

  @Get('transacoes')
  findTransacoes(@Query('encontroId') encontroId?: string) {
    return this.service.findTransacoes(encontroId);
  }

  @Get('saldo')
  saldo(@Query('encontroId') encontroId?: string) {
    return this.service.saldo(encontroId);
  }

  @Delete('transacoes/:id')
  @Roles(RoleName.ADMIN, RoleName.TESOURARIA)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
