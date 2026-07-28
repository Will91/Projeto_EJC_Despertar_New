import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAvisoDto {
  @IsString() @MinLength(3)
  titulo!: string;

  @IsString() @MinLength(3)
  conteudo!: string;

  @IsOptional() @IsBoolean()
  fixado?: boolean;
}
