import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TipoRecurso } from '@prisma/client';

export class CreateRecursoDto {
  @IsString() @MinLength(2)
  titulo!: string;

  @IsEnum(TipoRecurso)
  tipo!: TipoRecurso;

  @IsString() @MinLength(4)
  arquivoUrl!: string;

  @IsOptional() @IsString()
  descricao?: string;
}
