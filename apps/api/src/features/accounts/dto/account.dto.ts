import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  AccountPropertiesDto,
  CreditCardPropertiesDto,
  CurrentAccountPropertiesDto,
  LoanAccountPropertiesDto,
  MortgageAccountPropertiesDto,
  SavingAccountPropertiesDto,
} from './account-properties.dto';
import { Account } from '../entities/account.entity';
import { AccountType } from '../entities/accountType.model';
import { AccountSource } from '../entities/accountSource.model';
export class BalanceDto {
  @ApiProperty()
  amount: number;
  @ApiProperty()
  currency: string;
}

@ApiExtraModels(
  CurrentAccountPropertiesDto,
  CreditCardPropertiesDto,
  SavingAccountPropertiesDto,
  MortgageAccountPropertiesDto,
  LoanAccountPropertiesDto,
)
export class AccountDto {
  /**
   * The id of the account
   */
  @ApiProperty()
  id: string;

  /**
   * The name of the account
   */
  @ApiProperty()
  name: string;

  @ApiProperty({
    type: () => BalanceDto,
    description: 'The balance of the account',
    nullable: true,
  })
  balance: BalanceDto;

  @ApiProperty({ description: 'The currency of the account' })
  currency: string;

  @ApiProperty({ description: 'The type of the account', enum: AccountType })
  type: string;

  @ApiProperty({
    required: false,
    description:
      'The institution id of the account, if it belongs to an institution',
    nullable: true,
  })
  institutionId?: string | null;

  @ApiProperty({
    required: false,
    name: 'source',
    description: 'The tool used to create the account',
    enum: AccountSource,
  })
  source?: string;

  @ApiProperty({
    required: false,
    description: 'The source name that created this account',
    nullable: true,
  })
  sourceName?: string;

  @ApiProperty({
    required: false,
    description:
      'The extra properties of the account, depending on the account type',
    nullable: true,
    oneOf: [
      { $ref: getSchemaPath(CurrentAccountPropertiesDto) },
      { $ref: getSchemaPath(CreditCardPropertiesDto) },
      { $ref: getSchemaPath(SavingAccountPropertiesDto) },
      { $ref: getSchemaPath(MortgageAccountPropertiesDto) },
      { $ref: getSchemaPath(LoanAccountPropertiesDto) },
    ],
  })
  properties?: AccountPropertiesDto | null;

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
