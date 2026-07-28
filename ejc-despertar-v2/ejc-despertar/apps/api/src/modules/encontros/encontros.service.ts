import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusConfirmacao } from '@prisma/client';
import * as crypto from 'crypto';
import { CreateCasalDto } from './dto/create-casal.dto';
import { CreateCirculoDto } from './dto/create-circulo.dto';
import { CreateEncontroDto } from './dto/create-encontro.dto';
import { CreateInscricaoDto } from './dto/create-inscricao.dto';
import { UpdateEncontroDto } from './dto/update-encontro.dto';
import { EncontrosRepository } from './encontros.repository';

@Injectable()
export class EncontrosService {
  constructor(private readonly repository: EncontrosRepository) {}

  // ----- Encontro -----

  async createEncontro(dto: CreateEncontroDto) {
    // Regra herdada do legado (getSeExisteEncontroAtivo): só um
    // encontro pode estar com inscrições abertas/em andamento por vez.
    const ativo = await this.repository.findEncontroAtivo();
    if (ativo) {
      throw new ConflictException(
        `Já existe um encontro ativo ("${ativo.tema}"). Finalize-o antes de abrir outro.`,
      );
    }
    return this.repository.createEncontro({
      tema: dto.tema,
      numero: dto.numero,
      local: dto.local,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
      inicioInscricoes: dto.inicioInscricoes,
      fimInscricoes: dto.fimInscricoes,
      status: 'INSCRICOES_ABERTAS',
    });
  }

  async findEncontroAtivo() {
    const encontro = await this.repository.findEncontroAtivo();
    if (!encontro) {
      throw new NotFoundException('Nenhum encontro ativo no momento.');
    }
    return encontro;
  }

  async findEncontroById(id: string) {
    const encontro = await this.repository.findEncontroById(id);
    if (!encontro) {
      throw new NotFoundException('Encontro não encontrado.');
    }
    return encontro;
  }

  updateEncontro(id: string, dto: UpdateEncontroDto) {
    return this.repository.updateEncontro(id, dto);
  }

  async finalizarEncontro(id: string) {
    await this.findEncontroById(id);
    return this.repository.updateEncontro(id, { status: 'FINALIZADO' });
  }

  // ----- Circulo -----

  createCirculo(dto: CreateCirculoDto) {
    return this.repository.createCirculo({
      nome: dto.nome,
      encontro: { connect: { id: dto.encontroId } },
    });
  }

  findCirculosByEncontro(encontroId: string) {
    return this.repository.findCirculosByEncontro(encontroId);
  }

  // ----- Casal -----

  createCasal(dto: CreateCasalDto) {
    if (dto.primeiroComponenteId === dto.segundoComponenteId) {
      throw new BadRequestException('Os dois componentes do casal precisam ser pessoas diferentes.');
    }
    return this.repository.createCasal({
      encontro: { connect: { id: dto.encontroId } },
      primeiroComponente: { connect: { id: dto.primeiroComponenteId } },
      segundoComponente: { connect: { id: dto.segundoComponenteId } },
      telefone: dto.telefone,
      celular: dto.celular,
      endereco: dto.endereco,
    });
  }

  findCasaisByEncontro(encontroId: string) {
    return this.repository.findCasaisByEncontro(encontroId);
  }

  vincularCasalACirculo(casalId: string, circuloId: string) {
    return this.repository.vincularCasalACirculo(casalId, circuloId);
  }

  // ----- Inscricao -----

  async createInscricao(dto: CreateInscricaoDto) {
    const encontro = await this.findEncontroById(dto.encontroId);

    // Mesma regra de janela de inscrição do legado (getValidarDataInscricao),
    // agora validada no servidor em vez de depender do front confiar nela.
    const agora = new Date();
    if (agora < encontro.inicioInscricoes || agora > encontro.fimInscricoes) {
      throw new BadRequestException('O período de inscrições para este encontro está fechado.');
    }

    try {
      return await this.repository.createInscricao({
        pessoa: { connect: { id: dto.pessoaId } },
        encontro: { connect: { id: dto.encontroId } },
        ...(dto.circuloId ? { circulo: { connect: { id: dto.circuloId } } } : {}),
      });
    } catch (err: any) {
      // Violação da constraint @@unique([pessoaId, encontroId]) do schema.
      if (err?.code === 'P2002') {
        throw new ConflictException('Esta pessoa já está inscrita neste encontro.');
      }
      throw err;
    }
  }

  findInscricoesByEncontro(encontroId: string, status?: StatusConfirmacao) {
    return this.repository.findInscricoesByEncontro(encontroId, status);
  }

  async findInscricaoById(id: string) {
    const inscricao = await this.repository.findInscricaoById(id);
    if (!inscricao) {
      throw new NotFoundException('Inscrição não encontrada.');
    }
    return inscricao;
  }

  /** Confirma a inscrição e já emite o token de QR Code para o check-in. */
  async confirmarInscricao(id: string) {
    await this.findInscricaoById(id);
    const qrCodeToken = crypto.randomBytes(16).toString('hex');
    return this.repository.updateInscricao(id, {
      status: 'CONFIRMADO',
      confirmadoEm: new Date(),
      qrCodeToken,
    });
  }

  /** Substitui ConfirmacaoSabado/Domingo/Cartas do legado por um único método parametrizado. */
  async registrarEtapa(id: string, etapa: 'primeiroDia' | 'segundoDia' | 'cartas') {
    const inscricao = await this.findInscricaoById(id);
    if (inscricao.status !== 'CONFIRMADO') {
      throw new BadRequestException('Só é possível registrar etapas de uma inscrição confirmada.');
    }
    const campo = `${etapa}Em` as const;
    return this.repository.updateInscricao(id, { [campo]: new Date() });
  }

  async atrelarCasal(inscricaoId: string, casalId: string) {
    await this.findInscricaoById(inscricaoId);
    return this.repository.updateInscricao(inscricaoId, { casal: { connect: { id: casalId } } });
  }

  /** Check-in via QR Code (pedido no briefing original). */
  async registrarCheckIn(qrCodeToken: string, registradoPorId?: string) {
    const inscricao = await this.repository.findInscricaoByQrToken(qrCodeToken);
    if (!inscricao) {
      throw new NotFoundException('QR Code inválido ou inscrição não encontrada.');
    }
    if (inscricao.status !== 'CONFIRMADO') {
      throw new BadRequestException('Esta inscrição ainda não está confirmada.');
    }
    await this.repository.createCheckIn(inscricao.id, registradoPorId);
    return { pessoa: inscricao.pessoa, encontro: inscricao.encontro, checkInEm: new Date() };
  }

  async dashboard(encontroId: string) {
    const contagens = await this.repository.countInscricoesPorStatus(encontroId);
    const total = contagens.reduce((acc, c) => acc + c._count, 0);
    return {
      total,
      porStatus: Object.fromEntries(contagens.map((c) => [c.status, c._count])),
    };
  }
}
