import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateNotificacaoDto {
  @IsUUID()
  userId!: string;

  @IsString() @MinLength(2)
  titulo!: string;

  @IsString() @MinLength(2)
  mensagem!: string;
}
