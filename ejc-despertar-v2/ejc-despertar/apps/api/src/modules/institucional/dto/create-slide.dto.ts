import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSlideDto {
  @IsString() @MinLength(4)
  imagemUrl!: string;

  @IsOptional() @IsString()
  linkUrl?: string;

  @IsOptional() @IsInt()
  ordem?: number;
}
