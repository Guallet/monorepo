import { AccountType } from "@accounts/models/Account";

export interface AccountMetadataFormProps {
  accountType: AccountType;
}

export function AccountMetadataForm({ accountType }: AccountMetadataFormProps) {
  switch (accountType) {
    case AccountType.CURRENT_ACCOUNT:
      return <CurrentAccountForm />;

    case AccountType.CREDIT_CARD:
      return <CreditCardForm />;

    case AccountType.LOAN:
      return <LoanForm />;

    case AccountType.MORTGAGE:
      return <MortgageForm />;

    case AccountType.SAVINGS:
      return <SavingsForm />;

    case AccountType.PENSION:
    case AccountType.INVESTMENT:
    case AccountType.UNKNOWN:
    default:
      return null;
  }
}
