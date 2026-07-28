import { Module } from '@nestjs/common';
import { LocalStorageProvider } from './local-storage.provider';
import { STORAGE_PROVIDER } from './storage.interface';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
  providers: [{ provide: STORAGE_PROVIDER, useClass: LocalStorageProvider }],
})
export class UploadsModule {}
