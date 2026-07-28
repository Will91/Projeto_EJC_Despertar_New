import { Module } from '@nestjs/common';
import { BibliotecaController } from './biblioteca.controller';
import { BibliotecaRepository } from './biblioteca.repository';
import { BibliotecaService } from './biblioteca.service';

@Module({
  controllers: [BibliotecaController],
  providers: [BibliotecaService, BibliotecaRepository],
})
export class BibliotecaModule {}
