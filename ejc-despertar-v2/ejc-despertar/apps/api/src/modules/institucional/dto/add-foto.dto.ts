import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AddFotoDto {
  @IsUUID()
  albumId!: string;

  @IsString() @MinLength(4)
  url!: string;

  @IsOptional() @IsString()
  legenda?: string;
}
