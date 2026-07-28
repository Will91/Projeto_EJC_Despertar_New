import { Injectable } from '@nestjs/common';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly repository: AdminRepository,
    private readonly financeiroService: FinanceiroService,
  ) {}

  /** Visão geral pedida no briefing: "Dashboard" do painel administrativo. */
  async dashboard() {
    const [totalPessoas, usuariosAtivos, saldo] = await Promise.all([
      this.repository.countPessoas(),
      this.repository.countUsersAtivos(),
      this.financeiroService.saldo(),
    ]);

    return {
      totalPessoas,
      usuariosAtivos,
      financeiro: saldo,
    };
  }

  findAuditLogs(entidade?: string) {
    return this.repository.findAuditLogs({ entidade });
  }
}
