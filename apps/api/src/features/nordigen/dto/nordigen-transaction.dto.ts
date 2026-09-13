import { ApiProperty } from '@nestjs/swagger';

type NordigenTransactionGroupsSchema = NordigenTransactionGroupsDto;
type TransactionAmountSchema = TransactionAmountDto;
type ExternalAccountSchema = ExternalAccountDto;
type CurrencyExchangeSchema = CurrencyExchangeDto;
export class NordigenTransactionsDto {
  @ApiProperty({ type: () => NordigenTransactionGroupsDto })
  transactions: NordigenTransactionGroupsSchema;
}

export class NordigenTransactionGroupsDto {
  @ApiProperty({ type: () => [NordigenTransactionDto] })
  booked: NordigenTransactionDto[];

  @ApiProperty({ type: () => [NordigenTransactionDto] })
  pending: NordigenTransactionDto[];
}

export class NordigenTransactionDto {
  @ApiProperty()
  transactionId: string;
  @ApiProperty({ type: String, format: 'date-time' })
  bookingDate: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  bookingDateTime: Date;
  @ApiProperty({ type: () => TransactionAmountDto })
  transactionAmount: TransactionAmountSchema;
  @ApiProperty()
  proprietaryBankTransactionCode: string;
  @ApiProperty()
  remittanceInformationUnstructured: string;

  @ApiProperty({ required: false, type: () => ExternalAccountDto })
  debtorAccount?: ExternalAccountSchema;
  @ApiProperty({ required: false })
  debtorName?: string;
  @ApiProperty({ required: false, type: () => ExternalAccountDto })
  creditorAccount?: ExternalAccountSchema;
  @ApiProperty({ required: false })
  creditorName?: string;
  @ApiProperty({ required: false, type: () => CurrencyExchangeDto })
  currencyExchange?: CurrencyExchangeSchema;
  @ApiProperty({ required: false })
  entryReference?: string;
  @ApiProperty({ required: false })
  valueDate?: string;

  @ApiProperty({ nullable: true })
  additionalInformation: string | null;
}

export class ExternalAccountDto {
  @ApiProperty()
  iban: string;
}

export class CurrencyExchangeDto {
  @ApiProperty()
  exchangeRate: string;
  @ApiProperty({ type: () => TransactionAmountDto })
  instructedAmount: TransactionAmountSchema;
  @ApiProperty()
  sourceCurrency: string;
  @ApiProperty()
  targetCurrency: string;
  @ApiProperty()
  unitCurrency: string;
}

export class TransactionAmountDto {
  @ApiProperty()
  amount: string;
  @ApiProperty()
  currency: string;
}
