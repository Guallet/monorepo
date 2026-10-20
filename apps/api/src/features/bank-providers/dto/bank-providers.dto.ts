import { ApiProperty } from '@nestjs/swagger';

export class BankProviderCredentialDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty({ type: String, nullable: true })
  keyHint: string | null;
}

export class BankProviderAccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  institutionName: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  institutionLogo?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  provider?: string | null;

  @ApiProperty({ type: String, nullable: true })
  currency: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  balance?: string | null;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ type: String, nullable: true })
  linkedAccountId: string | null;
}

export class BankProviderAccountsResponseDto {
  @ApiProperty({ type: () => [BankProviderAccountDto] })
  accounts: BankProviderAccountDto[];
}

export class BankProviderImportResponseDto {
  @ApiProperty({ type: [String] })
  accountIds: string[];
}

export class BankProviderSyncResponseDto {
  @ApiProperty()
  accountsSynced: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}
