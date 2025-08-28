import { Currency } from "./Currency";

export class Money {
  amount: number;
  currency: Currency;

  constructor(amount: number, currency: Currency) {
    this.amount = amount;
    this.currency = currency;
  }

  static fromCurrencyCode(args: {
    amount: number;
    currencyCode: string;
  }): Money {
    const { amount, currencyCode } = args;
    return new Money(amount, Currency.fromISOCode(currencyCode));
  }

  format(locale?: string): string {
    // TODO: This only works on web. Check equivalent for React Native too
    locale ??= navigator.language;

    const currencyFormatter = Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.currency.code,
      currencySign: "standard",
      currencyDisplay: "narrowSymbol",
      useGrouping: true,
    });

    return currencyFormatter.format(this.amount);
  }
}
