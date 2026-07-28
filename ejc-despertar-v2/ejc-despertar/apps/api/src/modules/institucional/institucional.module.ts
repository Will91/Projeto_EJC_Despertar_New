import { Module } from '@nestjs/common';
import { InstitucionalController } from './institucional.controller';
import { InstitucionalRepository } from './institucional.repository';
import { InstitucionalService } from './institucional.service';

@Module({
  controllers: [InstitucionalController],
  providers: [InstitucionalService, InstitucionalRepository],
})
export class InstitucionalModule {}
