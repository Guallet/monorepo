import { Currency, ISO4217Currencies } from '@guallet/money';

export const availableCurrencies = Object.values(ISO4217Currencies).map(
  (currency) => Currency.fromISOCode(currency.code),
);

export function findCurrency(code: string | null): Currency | null {
  const normalized = code?.trim().toUpperCase();
  return (
    availableCurrencies.find((currency) => currency.code === normalized) ?? null
  );
}
