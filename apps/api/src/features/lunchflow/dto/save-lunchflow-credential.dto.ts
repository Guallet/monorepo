import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SaveLunchFlowCredentialDto } from './lunchflow.dto';

export class ValidatedSaveLunchFlowCredentialDto extends SaveLunchFlowCredentialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  apiKey: string;
}
