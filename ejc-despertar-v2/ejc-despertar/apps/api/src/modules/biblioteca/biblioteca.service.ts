import { Injectable } from '@nestjs/common';
import { TipoRecurso } from '@prisma/client';
import { BibliotecaRepository } from './biblioteca.repository';
import { CreateRecursoDto } from './dto/create-recurso.dto';

@Injectable()
export class BibliotecaService {
  constructor(private readonly repository: BibliotecaRepository) {}

  create(dto: CreateRecursoDto) {
    return this.repository.create(dto);
  }

  findMany(tipo?: TipoRecurso) {
    return this.repository.findMany(tipo);
  }

  remove(id: string) {
    return this.repository.delete(id);
  }
}
