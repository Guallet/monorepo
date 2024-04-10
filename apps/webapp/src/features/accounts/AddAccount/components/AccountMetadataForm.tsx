import { AccountTypeDto } from "@guallet/api-client";
import { CreditCardForm } from "./CreditCardForm";
import { CurrentAccountForm } from "./CurrentAccountForm";
import { LoanForm } from "./LoanForm";
import { MortgageForm } from "./MortgageForm";
import { SavingsForm } from "./SavingsForm";

export interface AccountMetadataFormProps {
  accountType: AccountTypeDto;
}

export function AccountMetadataForm({ accountType }: AccountMetadataFormProps) {
  switch (accountType) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return <CurrentAccountForm />;

    case AccountTypeDto.CREDIT_CARD:
      return <CreditCardForm />;

    case AccountTypeDto.LOAN:
      return <LoanForm />;

    case AccountTypeDto.MORTGAGE:
      return <MortgageForm />;

    case AccountTypeDto.SAVINGS:
      return <SavingsForm />;

    case AccountTypeDto.PENSION:
    case AccountTypeDto.INVESTMENT:
    case AccountTypeDto.UNKNOWN:
    default:
      return null;
  }
}
