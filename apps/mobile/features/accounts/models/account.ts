import { AccountTypeDto } from '@guallet/api-client';

export const ACCOUNT_TYPE_OPTIONS: Array<{
  type: AccountTypeDto;
  label: string;
}> = [
  { type: AccountTypeDto.CURRENT_ACCOUNT, label: 'Current account' },
  { type: AccountTypeDto.SAVINGS, label: 'Savings account' },
  { type: AccountTypeDto.CREDIT_CARD, label: 'Credit card' },
  { type: AccountTypeDto.INVESTMENT, label: 'Investment' },
  { type: AccountTypeDto.MORTGAGE, label: 'Mortgage' },
  { type: AccountTypeDto.LOAN, label: 'Loan' },
  { type: AccountTypeDto.PENSION, label: 'Pension' },
  { type: AccountTypeDto.UNKNOWN, label: 'Other' },
];

export const ACCOUNT_TYPE_ORDER: AccountTypeDto[] = [
  AccountTypeDto.CURRENT_ACCOUNT,
  AccountTypeDto.SAVINGS,
  AccountTypeDto.CREDIT_CARD,
  AccountTypeDto.INVESTMENT,
  AccountTypeDto.MORTGAGE,
  AccountTypeDto.LOAN,
  AccountTypeDto.PENSION,
  AccountTypeDto.UNKNOWN,
];

export function getAccountTypeLabel(type: AccountTypeDto): string {
  return (
    ACCOUNT_TYPE_OPTIONS.find((option) => option.type === type)?.label ??
    'Other'
  );
}

export function formatAccountCurrency(
  amount: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function getAccountInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function getAccountHue(name: string): number {
  let hash = 0;
  for (const character of name) {
    hash = Math.trunc(hash * 31 + character.codePointAt(0)!);
  }
  return Math.abs(hash) % 360;
}
