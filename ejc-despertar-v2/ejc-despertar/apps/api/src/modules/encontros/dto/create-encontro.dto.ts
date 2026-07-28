import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEncontroDto {
  @IsString() @MinLength(2)
  tema!: string;

  @IsOptional() @IsInt()
  numero?: number;

  @IsString() @MinLength(2)
  local!: string;

  @Type(() => Date) @IsDate()
  dataInicio!: Date;

  @IsOptional() @Type(() => Date) @IsDate()
  dataFim?: Date;

  @Type(() => Date) @IsDate()
  inicioInscricoes!: Date;

  @Type(() => Date) @IsDate()
  fimInscricoes!: Date;
}
