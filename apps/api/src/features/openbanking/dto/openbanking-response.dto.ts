import { ApiProperty } from '@nestjs/swagger';
import {
  NordigenAccountDto,
  NordigenAccountMetadataDto,
} from '../../nordigen/dto/nordigen-account.dto';

export class CountryDto {
  @ApiProperty({ minLength: 2, maxLength: 2 })
  code: string;

  @ApiProperty({ required: false })
  name?: string;
}

export class ObConnectionDto {
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

  @ApiProperty({ type: [String] })
  accounts: string[];

  @ApiProperty({ required: false })
  user_language?: string;

  @ApiProperty({ format: 'uri' })
  link: string;

  @ApiProperty({ required: false })
  ssn?: string;

  @ApiProperty({ required: false })
  account_selection?: boolean;

  @ApiProperty({ required: false })
  redirect_immediate?: boolean;
}

export class DeleteConnectionResponseDto {
  @ApiProperty({ type: () => ObConnectionDto })
  connection: ObConnectionDto;

  @ApiProperty({ type: [String] })
  accounts: string[];
}

export class RemoteAccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => NordigenAccountMetadataDto })
  metadata: NordigenAccountMetadataDto;

  @ApiProperty({ type: () => NordigenAccountDto, nullable: true })
  details: NordigenAccountDto | null;
}

export class CreateConnectionResponseDto {
  @ApiProperty({ format: 'uri' })
  link: string;

  @ApiProperty()
  institution_id: string;
}

export class ConnectAccountsResponseDto {
  @ApiProperty({ minimum: 0 })
  accounts_count: number;
}

export class OpenBankingAccountsResponseDto {
  @ApiProperty({ type: [String] })
  accounts: string[];
}

export class SyncAccountsResponseDto {
  @ApiProperty({ minimum: 0 })
  accounts_synced: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class LinkedOpenBankingAccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  resource_id?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  created?: Date;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  last_accessed?: Date;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  last_refreshed?: Date;

  @ApiProperty({ required: false })
  iban?: string;

  @ApiProperty({ required: false })
  institution_id?: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  linked_account_id?: string;
}

export class LinkedOpenBankingAccountResponseDto {
  @ApiProperty({ type: () => LinkedOpenBankingAccountDto })
  connectedAccount: LinkedOpenBankingAccountDto;
}
