import { AccountTypeDto } from '@guallet/api-client';
import {
  BankIcon,
  AccountCreditCardIcon,
  InvestmentIcon,
  LoanIcon,
  MortgageIcon,
  OtherAccountIcon,
  PensionIcon,
  SavingsIcon,
} from '@guallet/luna-mobile/icons';

const ICONS = {
  [AccountTypeDto.CURRENT_ACCOUNT]: BankIcon,
  [AccountTypeDto.SAVINGS]: SavingsIcon,
  [AccountTypeDto.CREDIT_CARD]: AccountCreditCardIcon,
  [AccountTypeDto.INVESTMENT]: InvestmentIcon,
  [AccountTypeDto.MORTGAGE]: MortgageIcon,
  [AccountTypeDto.LOAN]: LoanIcon,
  [AccountTypeDto.PENSION]: PensionIcon,
  [AccountTypeDto.UNKNOWN]: OtherAccountIcon,
};

export function AccountTypeIcon({
  type,
  color,
  size = 20,
}: Readonly<{
  type: AccountTypeDto;
  color?: string;
  size?: number;
}>) {
  const Icon = ICONS[type] ?? OtherAccountIcon;
  return <Icon color={color} size={size} />;
}
