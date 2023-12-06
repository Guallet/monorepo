import {
  BalanceTypeDto,
  NordigenAccountBalanceDto,
} from 'src/nordigen/dto/account.dto';

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

// export enum NordigenBalanceType {
//   BALANCE = 'closingBooked',
//   BALANCE = 'expected',
//   BALANCE = 'forwardAvailable',
//   INTERIM_AVAILABLE = 'interimAvailable',
//   BALANCE = 'interimBooked',
//   BALANCE = 'nonInvoiced',
//   BALANCE = 'openingBooked',
// }
