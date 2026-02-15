import { ApiProperty } from '@nestjs/swagger';
import { AccountSource } from '../entities/accountSource.model';
import { AccountType } from '../entities/accountType.model';

export class CreateAccountRequest {
  @ApiProperty({ description: 'The name of the account' })
  name: string;

  @ApiProperty({
    description: 'The initial balance of the account',
    nullable: true,
  })
  initial_balance?: number;

  @ApiProperty({
    description:
      'If true, creates an initial transaction to reflect the starting balance when non-zero',
    nullable: true,
    default: false,
  })
  create_balance_transaction?: boolean;

  @ApiProperty({
    description: 'The account type',
    nullable: false,
    enum: AccountType,
  })
  type: AccountType;

  @ApiProperty({
    description: 'The account origin source',
    nullable: true,
    enum: AccountSource,
  })
  source?: AccountSource;

  @ApiProperty({
    description: 'The account origin source name',
    nullable: true,
  })
  source_name?: string;

  @ApiProperty({ description: 'The institution id', nullable: true })
  institution_id?: string;

  @ApiProperty({
    description: 'The account currency (3 letters code)',
    nullable: false,
  })
  currency: string;

  constructor(props: CreateAccountRequest) {
    Object.assign(this, props);
  }
}
