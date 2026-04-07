import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsUUID,
  Length,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountSource } from '../entities/accountSource.model';
import {
  CreditCardProperties,
  CurrentAccountProperties,
  LoanAccountProperties,
  MortgageAccountProperties,
  SavingAccountProperties,
} from '../entities/account-properties.model';
import { AccountType } from '../entities/accountType.model';

export class CreateAccountRequest {
  @ApiProperty({ description: 'The name of the account' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The initial balance of the account',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  initial_balance?: number;

  @ApiProperty({
    description:
      'If true, creates an initial transaction to reflect the starting balance when non-zero',
    nullable: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  create_balance_transaction?: boolean;

  @ApiProperty({
    description: 'The account type',
    nullable: false,
    enum: AccountType,
  })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    description: 'The account origin source',
    nullable: true,
    enum: AccountSource,
  })
  @IsOptional()
  @IsEnum(AccountSource)
  source?: AccountSource;

  @ApiProperty({
    description: 'The account origin source name',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  source_name?: string;

  @ApiProperty({ description: 'The institution id', nullable: true })
  @IsOptional()
  @IsUUID()
  institution_id?: string;

  @ApiProperty({
    description: 'The account currency (3 letters code)',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    description:
      'Optional account-type specific properties (e.g. account numbers, rates, limits, terms)',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  properties?:
    | CurrentAccountProperties
    | CreditCardProperties
    | SavingAccountProperties
    | MortgageAccountProperties
    | LoanAccountProperties
    | null;

  constructor(props: CreateAccountRequest) {
    Object.assign(this, props);
  }
}
