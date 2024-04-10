import { AccountTypeDto } from "@guallet/api-client";

export type Account = {
  id: string;
  type: AccountTypeDto;
  name: string;
  balance: number;
  currency: string;
  connection_details?: AccountConnectionDto;
  institutionId: null | string;
  institution?: {
    id: string;
    name: string;
    image_src: string;
  };
};

export type AccountConnectionDto = {
  last_refreshed: Date;
  status: string;
};

// TODO: Extract this type to shared package
// export enum AccountType {
//   CURRENT_ACCOUNT = "current-account",
//   CREDIT_CARD = "credit-card",
//   SAVINGS = "savings-account",
//   INVESTMENT = "investment",
//   MORTGAGE = "mortgage",
//   LOAN = "loan",
//   PENSION = "pension",
//   UNKNOWN = "unknown",
// }

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

// TODO: Extract this function to shared package
export function getAccountTypeTitle(type: AccountTypeDto): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return "Current Accounts";
    case AccountTypeDto.CREDIT_CARD:
      return "Credit cards";
    case AccountTypeDto.INVESTMENT:
      return "Investment accounts";
    case AccountTypeDto.LOAN:
      return "Loans";
    case AccountTypeDto.MORTGAGE:
      return "Mortgages";
    case AccountTypeDto.PENSION:
      return "Pensions";
    case AccountTypeDto.SAVINGS:
      return "Saving accounts";

    default:
      return "Other";
  }
}
