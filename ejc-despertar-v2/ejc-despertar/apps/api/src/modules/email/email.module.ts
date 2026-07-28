import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

// @Global porque praticamente todo módulo que lida com usuário
// (auth, admin) pode eventualmente precisar notificar por e-mail.
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
