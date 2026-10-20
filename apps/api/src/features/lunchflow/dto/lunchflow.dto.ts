import { ApiProperty } from '@nestjs/swagger';
import { LunchFlowCredential } from '../entities/lunchflow-credential.entity';

export class LunchFlowCredentialDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty({ type: String, nullable: true })
  keyHint: string | null;

  static fromDomain(
    domain: LunchFlowCredential | null,
  ): LunchFlowCredentialDto {
    return {
      configured: domain !== null,
      keyHint: domain?.api_key_hint ?? null,
    };
  }
}

export class LunchFlowAccountDto {
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

export class LunchFlowAccountsResponseDto {
  @ApiProperty({ type: () => [LunchFlowAccountDto] })
  accounts: LunchFlowAccountDto[];
}

export class LunchFlowImportResponseDto {
  @ApiProperty({ type: [String] })
  accountIds: string[];
}

export class LunchFlowSyncResponseDto {
  @ApiProperty()
  accountsSynced: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}
