import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { FinanceiroRepository } from './financeiro.repository';

@Injectable()
export class FinanceiroService {
  constructor(private readonly repository: FinanceiroRepository) {}

  createCategoria(dto: CreateCategoriaDto) {
    return this.repository.createCategoria(dto);
  }
  findCategorias() {
    return this.repository.findCategorias();
  }

  createTransacao(dto: CreateTransacaoDto, autor: AuthenticatedUser) {
    return this.repository.createTransacao({
      tipo: dto.tipo,
      descricao: dto.descricao,
      valorCentavos: dto.valorCentavos,
      responsavelId: autor.userId,
      ...(dto.categoriaId ? { categoria: { connect: { id: dto.categoriaId } } } : {}),
      ...(dto.encontroId ? { encontro: { connect: { id: dto.encontroId } } } : {}),
    });
  }

  findTransacoes(encontroId?: string) {
    return this.repository.findTransacoes({ encontroId });
  }

  async saldo(encontroId?: string) {
    const { entradasCentavos, saidasCentavos } = await this.repository.somaPorTipo(encontroId);
    return {
      entradasCentavos,
      saidasCentavos,
      saldoCentavos: entradasCentavos - saidasCentavos,
    };
  }

  remove(id: string) {
    return this.repository.deleteTransacao(id);
  }
}
