import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { RoleName, TipoRecurso } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { BibliotecaService } from './biblioteca.service';
import { CreateRecursoDto } from './dto/create-recurso.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Biblioteca')
@Controller('biblioteca')
export class BibliotecaController {
  constructor(private readonly service: BibliotecaService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO, RoleName.SECRETARIA)
  create(@Body() dto: CreateRecursoDto) {
    return this.service.create(dto);
  }

  // Qualquer usuário autenticado (encontrista incluso) pode navegar a biblioteca.
  @Get()
  findMany(@Query('tipo') tipo?: TipoRecurso) {
    return this.service.findMany(tipo);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDENACAO)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
