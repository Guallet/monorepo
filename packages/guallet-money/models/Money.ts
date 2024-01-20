import { Currency } from "./Currency";

export class Money {
  amount: number;
  currency: Currency;

  constructor(amount: number, currency: Currency) {
    this.amount = amount;
    this.currency = currency;
  }

  static fromCurrencyCode(amount: number, currencyCode: string): Money {
    return new Money(amount, Currency.fromISOCode(currencyCode));
  }

  format(): string {
    const currencyFormatter = Intl.NumberFormat(undefined, {
      style: "currency",
      currency: this.currency.code,
    });

    return currencyFormatter.format(this.amount);
  }
}
