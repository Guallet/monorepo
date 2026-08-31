import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../entities/accountType.model.js';

export class CurrentAccountDetailsDto {
  @IsString()
  accountNumber: string;

  @IsString()
  sortCode: string;
}

export class CurrentAccountPropertiesDto {
  @ValidateNested()
  @Type(() => CurrentAccountDetailsDto)
  details: CurrentAccountDetailsDto;

  @IsNumber()
  @IsOptional()
  overdraft: number | null;
}

export class CreditCardPropertiesDto {
  @IsString()
  accountNumber: string;

  @IsNumber()
  interestRate: number;

  @IsNumber()
  creditLimit: number;

  @IsNumber()
  cycleDay: number;
}

export class SavingAccountPropertiesDto {
  @IsNumber()
  interestRate: number;
}

export class MortgageAccountPropertiesDto {
  @IsNumber()
  propertyValue: number;

  @IsNumber()
  mortgageAmount: number;

  @IsNumber()
  interestRate: number;

  @IsNumber()
  termLength: number;
}

export class LoanAccountPropertiesDto {
  @IsNumber()
  loanAmount: number;

  @IsNumber()
  interestRate: number;

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
