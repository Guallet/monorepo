export type AccountDto = {
  id: string;
  name: string;
  balance: { amount: number; currency: string };
  currency: string;
  type: AccountTypeDto;
  institutionId: string;
  source?: "manual" | "imported" | "synced" | "unknown";
  sourceName?: string;
  properties?:
    | CurrentAccountProperties
    | CreditCardProperties
    | SavingAccountProperties
    | null;
};

export type AccountConnectionDto = {
  last_refreshed: Date;
  status: string;
};

export enum AccountTypeDto {
  CURRENT_ACCOUNT = "current-account",
  CREDIT_CARD = "credit-card",
  SAVINGS = "savings-account",
  INVESTMENT = "investment",
  MORTGAGE = "mortgage",
  LOAN = "loan",
  PENSION = "pension",
  UNKNOWN = "unknown",
}

// export const AccountType = {
//   CURRENT_ACCOUNT: "current-account",
//   CREDIT_CARD: "credit-card",
//   SAVINGS: "savings-account",
//   INVESTMENT: "investment",
//   MORTGAGE: "mortgage",
//   LOAN: "loan",
//   PENSION: "pension",
//   UNKNOWN: "unknown",
// } as const;
// export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export enum AccountSourceDto {
  MANUAL = "manual",
  IMPORTED = "imported",
  SYNCED = "synced",
  UNKNOWN = "unknown",
}

export type CreateAccountRequest = {
  name: string;
  type: string;
  currency: string;
  initial_balance?: number;
  institution_id?: string;
  source?: AccountSourceDto;
  source_name?: string;
};

export type UpdateAccountRequest = {
  name?: string;
  type?: string;
  currency?: string;
  balance?: number;
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
  interestRate: number;
  creditLimit: number;
  cycleDay: "number" | "string";
}

export interface SavingAccountProperties {
  interestRate: number;
}

export interface AccountChartsDto {
  startDate: Date;
  endDate: Date;

  chart: AccountChartData[];
}

export interface AccountChartData {
  month: number;
  year: number;
  total_in: number;
  total_out: number;
}
