import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCirculoDto {
  @IsString() @MinLength(1)
  nome!: string;

  @IsUUID()
  encontroId!: string;
}
