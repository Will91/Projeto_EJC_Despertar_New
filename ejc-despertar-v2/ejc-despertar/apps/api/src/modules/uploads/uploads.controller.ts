import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { STORAGE_PROVIDER, StorageProvider } from './storage.interface';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Endpoint único de upload, reutilizado por várias telas (foto de
 * perfil da Pessoa, capa de Notícia, arquivo da Biblioteca). O campo
 * `folder` organiza os arquivos por contexto sem precisar de um
 * endpoint por módulo.
 */
@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Query('folder') folder = 'geral') {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou PDF.');
    }
    if (file.size > TAMANHO_MAXIMO_BYTES) {
      throw new BadRequestException('Arquivo maior que o limite de 8 MB.');
    }

    const pastaSegura = folder.replace(/[^a-z0-9-]/gi, '');
    const url = await this.storage.save(file, pastaSegura || 'geral');
    return { url };
  }
}
