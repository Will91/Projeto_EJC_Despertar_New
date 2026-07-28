export interface StorageProvider {
  /** Salva o arquivo e devolve a URL pública para acessá-lo depois. */
  save(file: Express.Multer.File, folder: string): Promise<string>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
