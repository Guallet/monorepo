import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SaveBankSyncCredentialDto } from './banksync.dto';

export class ValidatedSaveBankSyncCredentialDto extends SaveBankSyncCredentialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  apiKey: string;
}
