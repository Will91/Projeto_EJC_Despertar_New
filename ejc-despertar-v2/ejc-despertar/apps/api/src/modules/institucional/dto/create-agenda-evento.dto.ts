import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAgendaEventoDto {
  @IsString() @MinLength(2)
  titulo!: string;

  @IsOptional() @IsString()
  descricao?: string;

  @Type(() => Date) @IsDate()
  dataInicio!: Date;

  @IsOptional() @Type(() => Date) @IsDate()
  dataFim?: Date;

  @IsOptional() @IsString()
  local?: string;
}
