import { Module } from '@nestjs/common';
import { FormacoesController } from './formacoes.controller';
import { FormacoesRepository } from './formacoes.repository';
import { FormacoesService } from './formacoes.service';

@Module({
  controllers: [FormacoesController],
  providers: [FormacoesService, FormacoesRepository],
})
export class FormacoesModule {}
