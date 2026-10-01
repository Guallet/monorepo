import { AccountDto, AccountTypeDto } from '@guallet/api-client';

const ACCOUNT_TYPE_ORDER: AccountTypeDto[] = [
  AccountTypeDto.CURRENT_ACCOUNT,
  AccountTypeDto.SAVINGS,
  AccountTypeDto.CREDIT_CARD,
  AccountTypeDto.INVESTMENT,
  AccountTypeDto.MORTGAGE,
  AccountTypeDto.LOAN,
  AccountTypeDto.PENSION,
  AccountTypeDto.UNKNOWN,
];

export function groupAccounts(accounts: AccountDto[], search: string) {
  const query = search.trim().toLocaleLowerCase();
  const filtered = query
    ? accounts.filter((account) =>
        account.name.toLocaleLowerCase().includes(query),
      )
    : accounts;
  return ACCOUNT_TYPE_ORDER.map((type) => ({
    type,
    accounts: filtered.filter((account) => account.type === type),
  })).filter((group) => group.accounts.length > 0);
}

export function validateAccountForm(input: {
  name: string;
  currency: string;
  balance: string;
}) {
  const name = input.name.trim();
  const currency = input.currency.trim().toUpperCase();
  const balance = Number(input.balance.replace(',', '.'));
  if (!name) return { error: 'Enter an account name.' } as const;
  if (!/^[A-Z]{3}$/.test(currency))
    return {
      error: 'Use a three-letter currency code, such as GBP or EUR.',
    } as const;
  if (!input.balance.trim() || !Number.isFinite(balance))
    return { error: 'Enter a valid balance.' } as const;
  return { values: { name, currency, balance } } as const;
}

export function isManualAccount(account: AccountDto) {
  return (
    account.source === 'manual' ||
    account.source == null ||
    account.source === 'unknown'
  );
}

export function getMonthlyInOut(
  chart: Array<{
    month: number;
    year: number;
    total_in: number;
    total_out: number;
  }>,
) {
  return chart
    .slice()
    .sort((a, b) => (a.year === b.year ? b.month - a.month : b.year - a.year))
    .slice(0, 4);
}

export type AccountGroup = { type: AccountTypeDto; accounts: AccountDto[] };
