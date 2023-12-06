import { PartialType } from '@nestjs/swagger';
import { CreateOpenbankingDto } from './create-openbanking.dto';

export class UpdateOpenbankingDto extends PartialType(CreateOpenbankingDto) {}
