import { Module } from '@nestjs/common';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { RelatoriosService } from './relatorios.service';

@Module({
  imports: [FinanceiroModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, RelatoriosService],
})
export class AdminModule {}
