import { ApiProperty } from '@nestjs/swagger';
import { SynciCredential } from '../entities/synci-credential.entity';

export class SynciCredentialDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty({ type: String, nullable: true })
  keyHint: string | null;

  static fromDomain(domain: SynciCredential | null): SynciCredentialDto {
    return {
      configured: domain !== null,
      keyHint: domain?.api_key_hint ?? null,
    };
  }
}

export class SynciAccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  institutionName: string | null;

  @ApiProperty({ type: String, nullable: true })
  institutionLogo: string | null;

  @ApiProperty({ type: String, nullable: true })
  provider: string | null;

  @ApiProperty({ type: String, nullable: true })
  currency: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: String, nullable: true })
  linkedAccountId: string | null;
}

export class SynciAccountsResponseDto {
  @ApiProperty({ type: () => [SynciAccountDto] })
  accounts: SynciAccountDto[];
}

export class SaveSynciCredentialDto {
  @ApiProperty({ maxLength: 4096 })
  apiKey: string;
}

export class SynciImportResponseDto {
  @ApiProperty({ type: [String] })
  accountIds: string[];
}

export class SynciSyncResponseDto {
  @ApiProperty()
  accountsSynced: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}
