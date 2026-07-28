import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCasalDto {
  @IsUUID()
  encontroId!: string;

  @IsUUID()
  primeiroComponenteId!: string;

  @IsUUID()
  segundoComponenteId!: string;

  @IsOptional() @IsString()
  telefone?: string;

  @IsOptional() @IsString()
  celular?: string;

  @IsOptional() @IsString()
  endereco?: string;
}
