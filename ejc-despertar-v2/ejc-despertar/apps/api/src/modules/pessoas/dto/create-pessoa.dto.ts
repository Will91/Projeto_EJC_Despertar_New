import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreatePessoaDto {
  @IsString() @MinLength(2)
  nome!: string;

  @IsString() @MinLength(2)
  sobrenome!: string;

  @IsOptional() @IsString()
  apelido?: string;

  @IsOptional() @IsString()
  fotoUrl?: string;

  @IsOptional() @IsString()
  sexo?: string;

  @Type(() => Date)
  @IsDate({ message: 'Informe a data de nascimento no formato AAAA-MM-DD.' })
  dataNascimento!: Date;

  @IsOptional() @IsString()
  rg?: string;

  @IsOptional() @IsString()
  telefone?: string;

  @IsOptional() @IsString()
  celular?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  endereco?: string;

  @IsOptional() @IsString()
  numero?: string;

  @IsOptional() @IsString()
  bairro?: string;

  @IsOptional() @IsString()
  complemento?: string;

  @IsOptional() @IsString()
  cep?: string;

  @IsOptional() @IsString()
  responsavelNome?: string;

  @IsOptional() @IsString()
  responsavelParentesco?: string;

  @IsOptional() @IsString()
  responsavelCelular?: string;

  @IsOptional() @IsBoolean()
  batizado?: boolean;

  @IsOptional() @IsBoolean()
  primeiraComunhao?: boolean;

  @IsOptional() @IsBoolean()
  crismado?: boolean;

  @IsOptional() @IsString()
  observacoes?: string;

  @IsOptional() @IsUUID()
  equipeId?: string;
}
