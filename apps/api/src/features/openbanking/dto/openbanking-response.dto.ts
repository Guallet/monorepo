import { ApiProperty } from '@nestjs/swagger';
import {
  NordigenAccountDto,
  NordigenAccountMetadataDto,
} from '../../nordigen/dto/nordigen-account.dto.js';
import type { ObConnection } from '../entities/connection.entity.js';
import type { NordigenAccount } from '../entities/nordigen-account.entity.js';

export class OpenBankingCountryDto {
  @ApiProperty({ minLength: 2, maxLength: 2, example: 'GB' })
  code: string;

  @ApiProperty({ example: 'United Kingdom' })
  name: string;
}

export class OpenBankingConnectionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, format: 'date-time' })
  created: Date;

  @ApiProperty({ format: 'uri' })
  redirect: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  institution_id: string;

  @ApiProperty()
  agreement: string;

  @ApiProperty()
  reference: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
  })
  accounts: string[];

  @ApiProperty({ required: false, nullable: true })
  user_language?: string | null;

  @ApiProperty({ format: 'uri' })
  link: string;

  @ApiProperty({ required: false, nullable: true })
  account_selection?: boolean | null;

  @ApiProperty({ required: false, nullable: true })
  redirect_immediate?: boolean | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;

  static fromEntity(entity: ObConnection): OpenBankingConnectionDto {
    return {
      id: entity.id,
      created: entity.created,
      redirect: entity.redirect,
      status: entity.status,
      institution_id: entity.institution_id,
      agreement: entity.agreement,
      reference: entity.reference,
      accounts: entity.accounts,
      user_language: entity.user_language,
      link: entity.link,
      account_selection: entity.account_selection,
      redirect_immediate: entity.redirect_immediate,
      updated_at: entity.updated_at,
    };
  }
}

export class OpenBankingConnectionAccountDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ type: () => NordigenAccountMetadataDto })
  metadata: NordigenAccountMetadataDto;

  @ApiProperty({ type: () => NordigenAccountDto, nullable: true })
  details: NordigenAccountDto | null;
}

export class CreateOpenBankingConnectionResponseDto {
  @ApiProperty({ format: 'uri' })
  link: string;

  @ApiProperty()
  institution_id: string;
}

export class ConnectOpenBankingAccountsResponseDto {
  @ApiProperty({ minimum: 0 })
  accounts_count: number;
}

export class DeleteOpenBankingConnectionResponseDto {
  @ApiProperty({ format: 'uuid' })
  connection_id: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
  })
  accounts: string[];
}

export class SyncOpenBankingAccountResponseDto {
  @ApiProperty({ format: 'uuid' })
  account_id: string;

  @ApiProperty()
  synced: boolean;
}

export class SyncOpenBankingAccountsResponseDto {
  @ApiProperty({ minimum: 0 })
  accounts_synced: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class LinkedOpenBankingAccountDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ required: false, nullable: true })
  resourceId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  iban?: string | null;

  @ApiProperty({ required: false, nullable: true, minLength: 3, maxLength: 3 })
  currency?: string | null;

  @ApiProperty({ required: false, nullable: true })
  ownerName?: string | null;

  @ApiProperty({ required: false, nullable: true })
  name?: string | null;

  @ApiProperty({ required: false, nullable: true })
  bic?: string | null;

  @ApiProperty({ required: false, nullable: true })
  status?: string | null;

  @ApiProperty({ required: false, nullable: true })
  cashAccountType?: string | null;

  @ApiProperty({ required: false, nullable: true })
  maskedPan?: string | null;

  @ApiProperty({ required: false, nullable: true })
  details?: string | null;

  static fromEntity(entity: NordigenAccount): LinkedOpenBankingAccountDto {
    return {
      id: entity.id,
      resourceId: entity.resource_id,
      iban: entity.iban,
      currency: entity.currency,
      ownerName: entity.owner_name,
      name: entity.name,
      bic: entity.bic,
      status: entity.status,
      cashAccountType: entity.cashAccountType,
      maskedPan: entity.maskedPan,
      details: entity.details,
    };
  }
}

export class LinkedOpenBankingAccountResponseDto {
  @ApiProperty({ type: () => LinkedOpenBankingAccountDto })
  connectedAccount: LinkedOpenBankingAccountDto;
}

export class OpenBankingAccountIdsResponseDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
  })
  accounts: string[];
}
