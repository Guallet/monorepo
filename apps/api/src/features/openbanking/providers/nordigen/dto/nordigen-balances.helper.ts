import {
  BalanceTypeDto,
  NordigenAccountBalanceDto,
} from './nordigen-account.dto';

export function getBalanceFrom(
  balances: NordigenAccountBalanceDto[],
): { amount: number; currency: string } | null {
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
    };
  }

  const interim = balances.find(
    (a) => a.balanceType == BalanceTypeDto.INTERIM_AVAILABLE,
  );
  if (interim != null) {
    return {
      amount: Number(interim.balanceAmount.amount),
      currency: interim.balanceAmount.currency,
    };
  }

  const forwardAvailable = balances.find(
    (a) => a.balanceType == BalanceTypeDto.FORWARD_AVAILABLE,
  );
  if (forwardAvailable != null) {
    return {
      amount: Number(forwardAvailable.balanceAmount.amount),
      currency: forwardAvailable.balanceAmount.currency,
    };
  }

  const interimBooked = balances.find(
    (a) => a.balanceType == BalanceTypeDto.INTERIM_BOOKED,
  );
  if (interimBooked != null) {
    return {
      amount: Number(interimBooked.balanceAmount.amount),
      currency: interimBooked.balanceAmount.currency,
    };
  }

  return null;
}
