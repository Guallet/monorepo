import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../entities/accountType.model.js';
import { ApiProperty } from '@nestjs/swagger';

export class CurrentAccountDetailsDto {
  @ApiProperty()
  @IsString()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  sortCode: string;
}

export class CurrentAccountPropertiesDto {
  @ApiProperty({ type: () => CurrentAccountDetailsDto })
  @ValidateNested()
  @Type(() => CurrentAccountDetailsDto)
  details: CurrentAccountDetailsDto;

  @ApiProperty({ required: false, nullable: true })
  @IsNumber()
  @IsOptional()
  overdraft: number | null;
}

export class CreditCardPropertiesDto {
  @ApiProperty()
  @IsString()
  accountNumber: string;

  @ApiProperty()
  @IsNumber()
  interestRate: number;

  @ApiProperty()
  @IsNumber()
  creditLimit: number;

  @ApiProperty()
  @IsNumber()
  cycleDay: number;
}

export class SavingAccountPropertiesDto {
  @ApiProperty()
  @IsNumber()
  interestRate: number;
}

export class MortgageAccountPropertiesDto {
  @ApiProperty()
  @IsNumber()
  propertyValue: number;

  @ApiProperty()
  @IsNumber()
  mortgageAmount: number;

  @ApiProperty()
  @IsNumber()
  interestRate: number;

  @ApiProperty()
  @IsNumber()
  termLength: number;
}

export class LoanAccountPropertiesDto {
  @ApiProperty()
  @IsNumber()
  loanAmount: number;

  @ApiProperty()
  @IsNumber()
  interestRate: number;

  @ApiProperty()
  @IsNumber()
  termLength: number;
}

export type AccountPropertiesDto =
  | CurrentAccountPropertiesDto
  | CreditCardPropertiesDto
  | SavingAccountPropertiesDto
  | MortgageAccountPropertiesDto
  | LoanAccountPropertiesDto;

export const PROPERTIES_DTO_MAP: Partial<
  Record<AccountType, new () => AccountPropertiesDto>
> = {
  [AccountType.CURRENT_ACCOUNT]: CurrentAccountPropertiesDto,
  [AccountType.CREDIT_CARD]: CreditCardPropertiesDto,
  [AccountType.SAVINGS]: SavingAccountPropertiesDto,
  [AccountType.MORTGAGE]: MortgageAccountPropertiesDto,
  [AccountType.LOAN]: LoanAccountPropertiesDto,
};
