import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'A senha precisa ter pelo menos 8 caracteres.' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Informe o nome.' })
  nome!: string;

  @IsString()
  @IsNotEmpty({ message: 'Informe o sobrenome.' })
  sobrenome!: string;
}
