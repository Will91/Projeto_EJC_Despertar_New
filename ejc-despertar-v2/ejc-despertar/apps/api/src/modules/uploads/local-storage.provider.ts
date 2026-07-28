import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import type { StorageProvider } from './storage.interface';

/**
 * Implementação padrão: salva no disco local, servido como estático
 * pelo Nest (ver main.ts: useStaticAssets). Suficiente para desenvolvimento
 * e para um VPS com volume persistente.
 *
 * Para produção em plataformas serverless (Vercel/Railway sem disco
 * persistente), troque por uma implementação de StorageProvider que
 * suba para S3/R2/Cloudinary e devolva a URL do objeto — a interface
 * já foi desenhada para isso (Strategy Pattern), sem tocar em nenhum
 * controller que use uploads.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadsDir: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService) {
    this.uploadsDir = path.resolve(process.cwd(), 'uploads');
    this.publicUrl = config.get<string>('PUBLIC_UPLOADS_URL') ?? '/uploads';
  }

  async save(file: Express.Multer.File, folder: string): Promise<string> {
    const dir = path.join(this.uploadsDir, folder);
    await fs.mkdir(dir, { recursive: true });

    const extensao = path.extname(file.originalname);
    const nomeUnico = `${crypto.randomUUID()}${extensao}`;
    const caminhoCompleto = path.join(dir, nomeUnico);

    await fs.writeFile(caminhoCompleto, file.buffer);

    return `${this.publicUrl}/${folder}/${nomeUnico}`;
  }
}
