export type CurrencyAmount = {
  currency: string;
  amount: number;
};

export type CurrencyCashflow = {
  currency: string;
  income: number;
  expense: number;
};

function compareCurrencies(
  first: string,
  second: string,
  preferredCurrency: string,
): number {
  if (first === preferredCurrency) return -1;
  if (second === preferredCurrency) return 1;
  return first.localeCompare(second);
}

export function groupBalancesByCurrency(
  accounts: ReadonlyArray<{ balance: CurrencyAmount }>,
  preferredCurrency: string,
): CurrencyAmount[] {
  const totals = new Map<string, number>();
  for (const account of accounts) {
    const { currency, amount } = account.balance;
    totals.set(currency, (totals.get(currency) ?? 0) + amount);
  }

  if (totals.size === 0) totals.set(preferredCurrency, 0);

  return Array.from(totals, ([currency, amount]) => ({
    currency,
    amount,
  })).sort((first, second) =>
    compareCurrencies(first.currency, second.currency, preferredCurrency),
  );
}

export function groupCashflowByCurrency(
  transactions: ReadonlyArray<CurrencyAmount>,
  preferredCurrency: string,
): CurrencyCashflow[] {
  const totals = new Map<string, CurrencyCashflow>();
  for (const { currency, amount } of transactions) {
    const total = totals.get(currency) ?? { currency, income: 0, expense: 0 };
    if (amount > 0) total.income += amount;
    else total.expense += Math.abs(amount);
    totals.set(currency, total);
  }

  if (totals.size === 0) {
    totals.set(preferredCurrency, {
      currency: preferredCurrency,
      income: 0,
      expense: 0,
    });
  }

  return Array.from(totals.values()).sort((first, second) =>
    compareCurrencies(first.currency, second.currency, preferredCurrency),
  );
}
