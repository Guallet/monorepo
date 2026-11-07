import { ApiProperty } from '@nestjs/swagger';
import {
  BANK_PROVIDER_IDS,
  BankProviderId,
} from '../../openbanking/providers/bank-provider.interface';
import { AccountConnection } from '../models/account-connection.model';
import {
  BANK_CONNECTION_STATUSES,
  BankConnectionStatus,
} from '../../openbanking/models/bank-connection-state.model';

export class AccountConnectionDetailsDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: BANK_PROVIDER_IDS })
  providerId: BankProviderId;

  @ApiProperty({ description: 'Opaque provider account ID used for unlinking' })
  remoteAccountId: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description:
      'When the account was last connected or successfully refreshed',
  })
  lastRefresh: Date | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    minimum: 0,
    description:
      'Consent days remaining; null when expiry is unknown or does not apply',
  })
  daysRemaining: number | null;

  @ApiProperty({ enum: BANK_CONNECTION_STATUSES })
  status: BankConnectionStatus;
}

export class AccountConnectionDto {
  @ApiProperty({ type: () => AccountConnectionDetailsDto, required: false })
  connection?: AccountConnectionDetailsDto;

  static fromDomain(
    connection: AccountConnection | null,
  ): AccountConnectionDto {
    const dto = new AccountConnectionDto();
    if (connection) {
      const details = new AccountConnectionDetailsDto();
      details.id = connection.id;
      details.providerId = connection.providerId;
      details.remoteAccountId = connection.remoteAccountId;
      details.lastRefresh = connection.lastRefresh;
      details.daysRemaining = connection.daysRemaining;
      details.status = connection.status;
      dto.connection = details;
    }
    return dto;
  }
}
