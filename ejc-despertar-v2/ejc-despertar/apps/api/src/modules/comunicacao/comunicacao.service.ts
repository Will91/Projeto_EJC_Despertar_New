import { Injectable } from '@nestjs/common';
import { ComunicacaoRepository } from './comunicacao.repository';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';

@Injectable()
export class ComunicacaoService {
  constructor(private readonly repository: ComunicacaoRepository) {}

  createAviso(dto: CreateAvisoDto) {
    return this.repository.createAviso({ ...dto, fixado: dto.fixado ?? false });
  }
  findAvisos() {
    return this.repository.findAvisos();
  }
  removeAviso(id: string) {
    return this.repository.deleteAviso(id);
  }

  createNotificacao(dto: CreateNotificacaoDto) {
    return this.repository.createNotificacao({
      titulo: dto.titulo,
      mensagem: dto.mensagem,
      userId: dto.userId,
    });
  }
  findMinhasNotificacoes(userId: string) {
    return this.repository.findNotificacoesByUser(userId);
  }
  marcarLida(id: string) {
    return this.repository.marcarNotificacaoLida(id);
  }
}
