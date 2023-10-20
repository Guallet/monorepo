export type Account = {
  id: string;
  account_type: AccountType;
  name: string;
  balance: number;
  currency: string;
  connection_details?: AccountConnectionDto;

  financial_institution?: {
    id: string;
    name: string;
    logo: string;
  };
};

export type AccountConnectionDto = {
  last_refreshed: Date;
  status: string;
};

export const AccountType = {
  CURRENT_ACCOUNT: "current-account",
  CREDIT_CARD: "credit-card",
  SAVINGS: "savings-account",
  INVESTMENT: "investment",
  MORTGAGE: "mortgage",
  LOAN: "loan",
  PENSION: "pension",
  UNKNOWN: "unknown",
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];
