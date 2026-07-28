import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Encapsula o PrismaClient como um provider do Nest, garantindo
 * conexão/desconexão corretas com o ciclo de vida da aplicação.
 * Nenhum outro lugar do código deve importar @prisma/client
 * diretamente para abrir conexões — sempre via este service.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
