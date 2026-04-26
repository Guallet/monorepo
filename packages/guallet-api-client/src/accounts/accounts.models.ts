export type AccountDto = {
  id: string;
  name: string;
  balance: { amount: number; currency: string };
  currency: string;
  type: AccountTypeDto;
  institutionId: string;
  source?: 'manual' | 'imported' | 'synced' | 'unknown';
  sourceName?: string;
  properties?:
    | CurrentAccountProperties
    | CreditCardProperties
    | SavingAccountProperties
    | MortgageAccountProperties
    | LoanAccountProperties
    | null;
};

export type AccountConnectionDto = {
  last_refreshed: Date;
  status: string;
};

export enum AccountTypeDto {
  CURRENT_ACCOUNT = 'current-account',
  CREDIT_CARD = 'credit-card',
  SAVINGS = 'savings-account',
  INVESTMENT = 'investment',
  MORTGAGE = 'mortgage',
  LOAN = 'loan',
  PENSION = 'pension',
  UNKNOWN = 'unknown',
}

export enum AccountSourceDto {
  MANUAL = 'manual',
  IMPORTED = 'imported',
  SYNCED = 'synced',
  UNKNOWN = 'unknown',
}

export type CreateAccountRequest = {
  name: string;
  type: string;
  currency: string;
  initial_balance?: number;
  create_balance_transaction?: boolean;
  institution_id?: string;
  source?: AccountSourceDto;
  source_name?: string;
  properties?:
    | CurrentAccountProperties
    | CreditCardProperties
    | SavingAccountProperties
    | MortgageAccountProperties
    | LoanAccountProperties
    | null;
};

export type UpdateAccountRequest = {
  name?: string;
  type?: string;
  currency?: string;
  balance?: number;
  create_balance_transaction?: boolean;
  institution_id?: string;
};

export interface CurrentAccountProperties {
  details: {
    accountNumber: string;
    sortCode: string;
  };
  overdraft: number | null;
}

export interface CreditCardProperties {
  accountNumber: string;
  interestRate: number | null;
  creditLimit: number | null;
  cycleDay: number | null;
}

export interface SavingAccountProperties {
  interestRate: number | null;
}

export interface MortgageAccountProperties {
  propertyValue: number | null;
  mortgageAmount: number | null;
  interestRate: number | null;
  termLength: number | null;
}

export interface LoanAccountProperties {
  loanAmount: number | null;
  interestRate: number | null;
  termLength: number | null;
}

export interface BalanceHistoryPoint {
  date: string;
  balance: number;
}

export interface AccountChartsDto {
  startDate: Date;
  endDate: Date;
  chart: AccountChartData[];
  balanceHistory: BalanceHistoryPoint[];
}

export interface AccountChartData {
  month: number;
  year: number;
  total_in: number;
  total_out: number;
}
