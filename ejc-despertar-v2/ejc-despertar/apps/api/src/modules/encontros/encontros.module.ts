import { Module } from '@nestjs/common';
import { EncontrosController } from './encontros.controller';
import { EncontrosRepository } from './encontros.repository';
import { EncontrosService } from './encontros.service';

@Module({
  controllers: [EncontrosController],
  providers: [EncontrosService, EncontrosRepository],
  exports: [EncontrosService],
})
export class EncontrosModule {}
