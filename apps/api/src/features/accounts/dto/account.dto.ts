import { ApiProperty } from '@nestjs/swagger';
import {
  CreditCardProperties,
  CurrentAccountProperties,
  SavingAccountProperties,
} from '../entities/account-properties.model';
import { Account } from '../entities/account.entity';
import { AccountType } from '../entities/accountType.model';
import { AccountSource } from '../entities/accountSource.model';

export class AccountDto {
  @ApiProperty({ description: 'The id of the account' })
  id: string;

  @ApiProperty({ description: 'The name of the account' })
  name: string;

  @ApiProperty({
    description: 'The balance of the account',
    nullable: true,
  })
  balance: { amount: number; currency: string };

  @ApiProperty({ description: 'The currency of the account' })
  currency: string;

  @ApiProperty({ description: 'The type of the account' })
  type: AccountType;

  @ApiProperty({
    description:
      'The institution id of the account, if it belongs to an institution',
    nullable: true,
  })
  institutionId?: string;

  @ApiProperty({
    name: 'source',
    description: 'The tool used to create the account',
    enum: AccountSource,
  })
  source?: string;

  @ApiProperty({
    description: 'The source name that created this account',
    nullable: true,
  })
  sourceName?: string;

  @ApiProperty({
    description:
      'The extra properties of the account, depending on the account type',
    nullable: true,
  })
  properties?:
    | CurrentAccountProperties
    | CreditCardProperties
    | SavingAccountProperties
    | null;

  static fromDomain(domain: Account): AccountDto {
    return {
      id: domain.id,
      name: domain.name,
      currency: domain.currency,
      balance: {
        amount: domain.balance,
        currency: domain.currency,
      },
      type: domain.type,
      institutionId: domain.institutionId,
      properties: domain.properties,
      source: domain.source,
      sourceName: domain.source_name,
    };
  }
}
