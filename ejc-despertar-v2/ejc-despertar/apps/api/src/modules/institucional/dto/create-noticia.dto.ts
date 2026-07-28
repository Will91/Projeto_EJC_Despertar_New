import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNoticiaDto {
  @IsString() @MinLength(4)
  titulo!: string;

  @IsString() @MinLength(10)
  conteudo!: string;

  @IsOptional() @IsString()
  capaUrl?: string;
}
