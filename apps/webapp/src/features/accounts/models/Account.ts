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

import i118n from "@/i18n/i18n";

// TODO: Extract this function to shared package
export function getAccountTypeTitle(type: AccountTypeDto): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return i118n.t(
        "app.accounts.accountType.currentAccounts",
        "Current Accounts"
      );
    case AccountTypeDto.CREDIT_CARD:
      return i118n.t("app.accounts.accountType.creditCards", "Credit Cards");
    case AccountTypeDto.INVESTMENT:
      return i118n.t(
        "app.accounts.accountType.investmentAccounts",
        "Investment Accounts"
      );
    case AccountTypeDto.LOAN:
      return i118n.t("app.accounts.accountType.loans", "Loans");
    case AccountTypeDto.MORTGAGE:
      return i118n.t("app.accounts.accountType.mortgages", "Mortgages");
    case AccountTypeDto.PENSION:
      return i118n.t("app.accounts.accountType.pensions", "Pensions");
    case AccountTypeDto.SAVINGS:
      return i118n.t(
        "app.accounts.accountType.savingsAccounts",
        "Savings Accounts"
      );

    default:
      return i118n.t("app.accounts.accountType.unknown", "Other");
  }
}

export function getAccountTypeTitleSingular(type: AccountTypeDto): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return "Current Account";
    case AccountTypeDto.CREDIT_CARD:
      return "Credit card";
    case AccountTypeDto.INVESTMENT:
      return "Investment account";
    case AccountTypeDto.LOAN:
      return "Loan";
    case AccountTypeDto.MORTGAGE:
      return "Mortgage";
    case AccountTypeDto.PENSION:
      return "Pension";
    case AccountTypeDto.SAVINGS:
      return "Saving account";

    default:
      return "Other";
  }
}
