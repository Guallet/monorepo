import { Money } from '@guallet/money';
import {
  BalanceTypeDto,
  NordigenAccountBalanceDto,
} from './nordigen-account.dto';
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
