import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({ type: Object })
  transactionAmount: TransactionAmountDto;
  proprietaryBankTransactionCode: string;
  remittanceInformationUnstructured: string;

  @ApiPropertyOptional({ type: Object })
  debtorAccount?: ExternalAccountDto;
  debtorName?: string;
  @ApiPropertyOptional({ type: Object })
  creditorAccount?: ExternalAccountDto;
  creditorName?: string;
  @ApiPropertyOptional({ type: Object })
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
