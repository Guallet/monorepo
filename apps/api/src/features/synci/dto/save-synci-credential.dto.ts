import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SaveSynciCredentialDto } from './synci.dto';

export class ValidatedSaveSynciCredentialDto extends SaveSynciCredentialDto {
  @ApiProperty({ maxLength: 4096 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  apiKey: string;
}
