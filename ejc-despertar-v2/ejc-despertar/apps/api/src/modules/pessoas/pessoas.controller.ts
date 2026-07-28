import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { PessoasService } from './pessoas.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Pessoas')
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.SECRETARIA, RoleName.COORDENACAO)
  create(@Body() dto: CreatePessoaDto) {
    return this.pessoasService.create(dto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SECRETARIA, RoleName.COORDENACAO)
  findMany(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    return this.pessoasService.findMany({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      search,
    });
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SECRETARIA, RoleName.COORDENACAO)
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.pessoasService.findById(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.SECRETARIA, RoleName.COORDENACAO)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePessoaDto) {
    return this.pessoasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pessoasService.remove(id);
  }
}
