import { Module } from '@nestjs/common';
import { ComunicacaoController } from './comunicacao.controller';
import { ComunicacaoRepository } from './comunicacao.repository';
import { ComunicacaoService } from './comunicacao.service';

@Module({
  controllers: [ComunicacaoController],
  providers: [ComunicacaoService, ComunicacaoRepository],
})
export class ComunicacaoModule {}
