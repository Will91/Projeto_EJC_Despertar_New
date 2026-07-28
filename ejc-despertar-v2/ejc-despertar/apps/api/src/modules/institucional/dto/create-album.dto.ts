import { IsString, MinLength } from 'class-validator';

export class CreateAlbumDto {
  @IsString() @MinLength(2)
  titulo!: string;
}
