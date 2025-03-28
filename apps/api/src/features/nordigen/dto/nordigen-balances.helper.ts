import {
  BalanceTypeDto,
  NordigenAccountBalanceDto,
} from 'src/features/nordigen/dto/nordigen-account.dto';

// TODO: Use "@guallet/money" instead of this
export class Money {
  amount: number;
  currency: string;

  constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  static fromCurrencyCode(args: {
    amount: number;
    currencyCode: string;
  }): Money {
    const { amount, currencyCode } = args;
    return new Money(amount, currencyCode);
  }

  format(): string {
    const currencyFormatter = Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: this.currency,
    });

    return currencyFormatter.format(this.amount);
  }
}

/**
 * @deprecated The method should not be used. Use 'getMoneyBalanceFrom' instead.
 */
export function getBalanceAmountFrom(
  balances: NordigenAccountBalanceDto[],
): number {
  // If there is no balance available, return 0
  if (balances.length === 0) {
    return 0;
  }

  // If there is only 1 balance, then return it
  if (balances.length === 1) {
    return Number(balances[0].balanceAmount.amount);
  }

  const interim = balances.find(
    (a) => a.balanceType == BalanceTypeDto.INTERIM_AVAILABLE,
  );
  if (interim != null) {
    return Number(interim.balanceAmount.amount);
  }

  const forwardAvailable = balances.find(
    (a) => a.balanceType == BalanceTypeDto.FORWARD_AVAILABLE,
  );
  if (forwardAvailable != null) {
    return Number(forwardAvailable.balanceAmount.amount);
  }

  const interimBooked = balances.find(
    (a) => a.balanceType == BalanceTypeDto.INTERIM_BOOKED,
  );
  if (interimBooked != null) {
    return Number(interimBooked.balanceAmount.amount);
  }

  return 0;
}

export function getMoneyBalanceFrom(
  balances: NordigenAccountBalanceDto[],
): Money | null {
  // If there is no balance available, return null
  if (balances.length === 0) {
    return null;
  }

  // If there is only 1 balance, then return it
  if (balances.length === 1) {
    const balance = balances[0];
    return Money.fromCurrencyCode({
      amount: Number(balance.balanceAmount.amount),
      currencyCode: balance.balanceAmount.currency,
    });
  }

  const interim = balances.find(
    (a) => a.balanceType == BalanceTypeDto.INTERIM_AVAILABLE,
  );
  if (interim != null) {
    return Money.fromCurrencyCode({
      amount: Number(interim.balanceAmount.amount),
      currencyCode: interim.balanceAmount.currency,
    });
  }

  const forwardAvailable = balances.find(
    (a) => a.balanceType == BalanceTypeDto.FORWARD_AVAILABLE,
  );
  if (forwardAvailable != null) {
    return Money.fromCurrencyCode({
      amount: Number(forwardAvailable.balanceAmount.amount),
      currencyCode: forwardAvailable.balanceAmount.currency,
    });
  }

  const interimBooked = balances.find(
    (a) => a.balanceType == BalanceTypeDto.INTERIM_BOOKED,
  );
  if (interimBooked != null) {
    return Money.fromCurrencyCode({
      amount: Number(interimBooked.balanceAmount.amount),
      currencyCode: interimBooked.balanceAmount.currency,
    });
  }

  return null;
}

// export enum NordigenBalanceType {
//   BALANCE = 'closingBooked',
//   BALANCE = 'expected',
//   BALANCE = 'forwardAvailable',
//   INTERIM_AVAILABLE = 'interimAvailable',
//   BALANCE = 'interimBooked',
//   BALANCE = 'nonInvoiced',
//   BALANCE = 'openingBooked',
// }
