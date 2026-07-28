import { Injectable } from '@nestjs/common';
import { CreateFichaFormacaoDto } from './dto/create-ficha-formacao.dto';
import { FormacoesRepository } from './formacoes.repository';

@Injectable()
export class FormacoesService {
  constructor(private readonly repository: FormacoesRepository) {}

  create(dto: CreateFichaFormacaoDto) {
    return this.repository.create(dto);
  }

  findMany() {
    return this.repository.findMany();
  }

  remove(id: string) {
    return this.repository.delete(id);
  }
}
