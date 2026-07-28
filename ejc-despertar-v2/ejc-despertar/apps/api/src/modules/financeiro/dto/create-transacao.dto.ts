import { IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';
import { TipoTransacao } from '@prisma/client';

export class CreateTransacaoDto {
  @IsEnum(TipoTransacao)
  tipo!: TipoTransacao;

  @IsString() @MinLength(2)
  descricao!: string;

  /** Valor em CENTAVOS — nunca em ponto flutuante (decisão da Etapa 4). */
  @IsInt() @IsPositive()
  valorCentavos!: number;

  @IsOptional() @IsUUID()
  categoriaId?: string;

  @IsOptional() @IsUUID()
  encontroId?: string;
}
