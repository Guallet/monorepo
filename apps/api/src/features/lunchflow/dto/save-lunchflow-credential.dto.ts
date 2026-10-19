import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SaveLunchFlowCredentialDto } from './lunchflow.dto';

export class ValidatedSaveLunchFlowCredentialDto extends SaveLunchFlowCredentialDto {
  @ApiProperty({ maxLength: 4096 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  apiKey: string;
}
