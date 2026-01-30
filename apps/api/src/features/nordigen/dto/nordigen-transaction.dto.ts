export class NordigenTransactionsDto {
  transactions: {
    booked: NordigenTransactionDto[];
    pending: NordigenTransactionDto[];
  };
}

export class NordigenTransactionDto {
  transactionId: string;
  bookingDate: Date;
  bookingDateTime: Date;
  transactionAmount: TransactionAmountDto;
  proprietaryBankTransactionCode: string;
  remittanceInformationUnstructured: string;

  debtorAccount?: ExternalAccountDto;
  debtorName?: string;
  creditorAccount?: ExternalAccountDto;
  creditorName?: string;
  currencyExchange?: CurrencyExchangeDto;
  entryReference?: string;
  valueDate?: string;

  additionalInformation: string | null;
}

export class ExternalAccountDto {
  iban: string;
}

export class CurrencyExchangeDto {
  exchangeRate: string;
  instructedAmount: TransactionAmountDto;
  sourceCurrency: string;
  targetCurrency: string;
  unitCurrency: string;
}

export class TransactionAmountDto {
  amount: string;
  currency: string;
}
