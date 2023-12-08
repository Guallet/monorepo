export class NordigenTransactionsDto {
  transactions: {
    booked: NordigenTransactionDto[];
    pending: NordigenTransactionDto[];
  };
}

export class NordigenTransactionDto {
  transactionId: string;
  bookingDate: Date;
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

export interface ExternalAccountDto {
  iban: string;
}

export interface CurrencyExchangeDto {
  exchangeRate: string;
  instructedAmount: TransactionAmountDto;
  sourceCurrency: string;
  targetCurrency: string;
  unitCurrency: string;
}

export interface TransactionAmountDto {
  amount: string;
  currency: string;
}
