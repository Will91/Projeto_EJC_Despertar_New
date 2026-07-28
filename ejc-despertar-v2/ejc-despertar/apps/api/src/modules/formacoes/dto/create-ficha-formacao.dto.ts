import { IsEmail, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateFichaFormacaoDto {
  @IsString() @MinLength(2)
  nome!: string;

  @IsEmail()
  email!: string;

  @IsInt()
  @Min(14, { message: 'Idade mínima para trabalhar em equipe é 14 anos.' })
  @Max(120)
  idade!: number;

  @IsString() @MinLength(1)
  ultimoEncontroTrabalhado!: string;

  @IsString() @MinLength(1)
  ultimaEquipe!: string;
}
