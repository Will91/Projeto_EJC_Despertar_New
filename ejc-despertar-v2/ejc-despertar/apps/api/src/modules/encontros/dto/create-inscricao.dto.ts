import { IsOptional, IsUUID } from 'class-validator';

export class CreateInscricaoDto {
  @IsUUID()
  pessoaId!: string;

  @IsUUID()
  encontroId!: string;

  @IsOptional() @IsUUID()
  circuloId?: string;
}
