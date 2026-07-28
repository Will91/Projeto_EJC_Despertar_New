import { PartialType } from '@nestjs/mapped-types';
import { CreateEncontroDto } from './create-encontro.dto';

export class UpdateEncontroDto extends PartialType(CreateEncontroDto) {}
