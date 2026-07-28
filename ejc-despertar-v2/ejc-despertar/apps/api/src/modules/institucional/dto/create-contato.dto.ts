import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateContatoDto {
  @IsString() @MinLength(2)
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString() @MinLength(5)
  mensagem!: string;
}
