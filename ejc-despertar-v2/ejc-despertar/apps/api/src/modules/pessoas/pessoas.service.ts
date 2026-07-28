import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { PessoasRepository } from './pessoas.repository';

const IDADE_MINIMA_SEM_RESPONSAVEL = 18;

/** Calcula idade em anos completos a partir da data de nascimento. */
function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const aindaNaoFezAniversarioEsteAno =
    hoje.getMonth() < dataNascimento.getMonth() ||
    (hoje.getMonth() === dataNascimento.getMonth() && hoje.getDate() < dataNascimento.getDate());
  if (aindaNaoFezAniversarioEsteAno) idade--;
  return idade;
}

@Injectable()
export class PessoasService {
  constructor(private readonly repository: PessoasRepository) {}

  create(dto: CreatePessoaDto) {
    this.validarResponsavelSeMenor(dto.dataNascimento, dto.responsavelNome, dto.responsavelCelular);
    const { equipeId, ...rest } = dto;
    return this.repository.create({
      ...rest,
      ...(equipeId ? { equipe: { connect: { id: equipeId } } } : {}),
    });
  }

  /**
   * Regra identificada na Etapa 4: boa parte do público do EJC são
   * jovens menores de idade, e o legado já coletava dados de
   * responsável — mas nunca tornava isso obrigatório. Formalizamos
   * essa regra aqui.
   */
  private validarResponsavelSeMenor(
    dataNascimento: Date,
    responsavelNome?: string,
    responsavelCelular?: string,
  ) {
    const idade = calcularIdade(new Date(dataNascimento));
    if (idade < IDADE_MINIMA_SEM_RESPONSAVEL && (!responsavelNome || !responsavelCelular)) {
      throw new BadRequestException(
        'Para encontristas menores de 18 anos, é obrigatório informar nome e celular de um responsável.',
      );
    }
  }

  async findById(id: string) {
    const pessoa = await this.repository.findById(id);
    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada.');
    }
    return pessoa;
  }

  async findMany(query: { page?: number; pageSize?: number; search?: string }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [items, total] = await this.repository.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: query.search,
    });
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async update(id: string, dto: UpdatePessoaDto) {
    const atual = await this.findById(id); // garante 404 consistente antes de tentar atualizar
    this.validarResponsavelSeMenor(
      dto.dataNascimento ?? atual.dataNascimento,
      dto.responsavelNome ?? atual.responsavelNome ?? undefined,
      dto.responsavelCelular ?? atual.responsavelCelular ?? undefined,
    );
    const { equipeId, ...rest } = dto;
    return this.repository.update(id, {
      ...rest,
      ...(equipeId ? { equipe: { connect: { id: equipeId } } } : {}),
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
