import { ApiProperty } from '@nestjs/swagger';
import { BankSyncCredential } from '../entities/banksync-credential.entity';

export class BankSyncCredentialDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty({ type: String, nullable: true })
  keyHint: string | null;

  static fromDomain(domain: BankSyncCredential | null): BankSyncCredentialDto {
    return {
      configured: domain !== null,
      keyHint: domain?.api_key_hint ?? null,
    };
  }
}

export class BankSyncAccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bankId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  institutionName: string;

  @ApiProperty({ type: String, nullable: true })
  currency: string | null;

  @ApiProperty({ type: String, nullable: true })
  balance: string | null;

  @ApiProperty({ type: String, nullable: true })
  linkedAccountId: string | null;
}

export class BankSyncAccountsResponseDto {
  @ApiProperty({ type: () => [BankSyncAccountDto] })
  accounts: BankSyncAccountDto[];
}

export class BankSyncImportResponseDto {
  @ApiProperty({ type: [String] })
  accountIds: string[];
}

export class BankSyncSyncResponseDto {
  @ApiProperty()
  accountsSynced: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class SaveBankSyncCredentialDto {
  @ApiProperty({ maxLength: 4096 })
  apiKey: string;
}
