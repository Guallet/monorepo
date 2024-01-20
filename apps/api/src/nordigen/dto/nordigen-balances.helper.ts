import {
  BalanceTypeDto,
  NordigenAccountBalanceDto,
} from 'src/nordigen/dto/nordigen-account.dto';

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

/**
 * @deprecated Temporary while I fix the "@guallet/money" library.
 */
export interface Money {
  amount: number;
  currency: string;
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
    return {
      amount: Number(balance.balanceAmount.amount),
      currency: balance.balanceAmount.currency,
    } as Money;
  }

  const interim = balances.find(
    (a) => a.balanceType == BalanceTypeDto.INTERIM_AVAILABLE,
  );
  if (interim != null) {
    return {
      amount: Number(interim.balanceAmount.amount),
      currency: interim.balanceAmount.currency,
    } as Money;
  }

  const forwardAvailable = balances.find(
    (a) => a.balanceType == BalanceTypeDto.FORWARD_AVAILABLE,
  );
  if (forwardAvailable != null) {
    return {
      amount: Number(forwardAvailable.balanceAmount.amount),
      currency: forwardAvailable.balanceAmount.currency,
    } as Money;
  }

  const interimBooked = balances.find(
    (a) => a.balanceType == BalanceTypeDto.INTERIM_BOOKED,
  );
  if (interimBooked != null) {
    return {
      amount: Number(interimBooked.balanceAmount.amount),
      currency: interimBooked.balanceAmount.currency,
    } as Money;
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
