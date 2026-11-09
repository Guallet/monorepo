import { ApiProperty } from '@nestjs/swagger';
import {
  BANK_PROVIDER_IDS,
  BankProvider,
} from '../../openbanking/providers/bank-provider.interface';
import { AccountConnection } from '../../openbanking/models/account-connection.model';
import {
  BANK_CONNECTION_STATUSES,
  BankConnectionStatus,
} from '../../openbanking/models/bank-connection-state.model';

export class AccountConnectionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: BANK_PROVIDER_IDS })
  providerId: BankProvider;

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

  static fromDomain(connection: AccountConnection): AccountConnectionDto {
    const dto = new AccountConnectionDto();
    dto.id = connection.id;
    dto.providerId = connection.providerId;
    dto.remoteAccountId = connection.remoteAccountId;
    dto.lastRefresh = connection.lastRefresh;
    dto.daysRemaining = connection.daysRemaining;
    dto.status = connection.status;
    return dto;
  }
}
