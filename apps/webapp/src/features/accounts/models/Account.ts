import { AccountTypeDto } from "@guallet/api-client";

import i118n from "@/i18n/i18n";

// TODO: Extract this function to shared package
export function getAccountTypeTitle(type: AccountTypeDto): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return i118n.t(
        "feature.accounts.accountType.currentAccounts",
        "Current Accounts"
      );
    case AccountTypeDto.CREDIT_CARD:
      return i118n.t(
        "feature.accounts.accountType.creditCards",
        "Credit Cards"
      );
    case AccountTypeDto.INVESTMENT:
      return i118n.t(
        "feature.accounts.accountType.investmentAccounts",
        "Investment Accounts"
      );
    case AccountTypeDto.LOAN:
      return i118n.t("feature.accounts.accountType.loans", "Loans");
    case AccountTypeDto.MORTGAGE:
      return i118n.t("feature.accounts.accountType.mortgages", "Mortgages");
    case AccountTypeDto.PENSION:
      return i118n.t("feature.accounts.accountType.pensions", "Pensions");
    case AccountTypeDto.SAVINGS:
      return i118n.t(
        "feature.accounts.accountType.savingsAccounts",
        "Savings Accounts"
      );

    default:
      return i118n.t("feature.accounts.accountType.unknown", "Other");
  }
}

export function getAccountTypeTitleSingular(type: AccountTypeDto): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return i118n.t(
        "feature.accounts.accountType.currentAccount",
        "Current Account"
      );
    case AccountTypeDto.CREDIT_CARD:
      return i118n.t("feature.accounts.accountType.creditCard", "Credit Card");
    case AccountTypeDto.INVESTMENT:
      return i118n.t(
        "feature.accounts.accountType.investment",
        "Investments Account"
      );
    case AccountTypeDto.LOAN:
      return i118n.t("feature.accounts.accountType.loan", "Loan");
    case AccountTypeDto.MORTGAGE:
      return i118n.t("feature.accounts.accountType.mortgage", "Mortgage");
    case AccountTypeDto.PENSION:
      return i118n.t("feature.accounts.accountType.pension", "Pension");
    case AccountTypeDto.SAVINGS:
      return i118n.t(
        "feature.accounts.accountType.savingsAccount",
        "Savings Account"
      );

    default:
      return i118n.t("feature.accounts.accountType.unknown", "Other");
  }
}
