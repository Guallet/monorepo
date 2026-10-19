import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidatedImportLunchFlowAccountsDto {
  @ApiProperty({ type: [String], minItems: 1 })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  accountIds: string[];
}
