import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SaveBankSyncCredentialDto } from './banksync.dto';

export class ValidatedSaveBankSyncCredentialDto extends SaveBankSyncCredentialDto {
  @ApiProperty({ maxLength: 4096 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  apiKey: string;
}
