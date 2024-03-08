export type AccountDto = {
  // id: string;
  // type: AccountTypeDto;
  // name: string;
  // balance: number;
  // currency: string;
  // connection_details?: AccountConnectionDto;
  // institutionId: null | string;
  // institution?: {
  //   id: string;
  //   name: string;
  //   image_src: string;
  // };

  id: string;
  name: string;
  balance: { amount: number; currency: string };
  currency: string;
  type: AccountTypeDto;
  institutionId: string;
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

export type CreateAccountRequest = {
  name: string;
  type: string;
  currency: string;
  initial_balance?: number;
  institution_id?: string;
};

export type UpdateAccountRequest = {
  name?: string;
  type?: string;
  currency?: string;
  initial_balance?: number;
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
