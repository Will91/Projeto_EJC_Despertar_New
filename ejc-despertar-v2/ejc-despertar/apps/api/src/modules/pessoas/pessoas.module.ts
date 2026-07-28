import { Module } from '@nestjs/common';
import { PessoasController } from './pessoas.controller';
import { PessoasRepository } from './pessoas.repository';
import { PessoasService } from './pessoas.service';

@Module({
  controllers: [PessoasController],
  providers: [PessoasService, PessoasRepository],
  exports: [PessoasService],
})
export class PessoasModule {}
