import { ApiProperty } from '@nestjs/swagger';

export class NordigenTransactionsDto {
  @ApiProperty({
    type: 'object',
    properties: {
      booked: {
        type: 'array',
        items: { $ref: '#/components/schemas/NordigenTransactionDto' },
      },
      pending: {
        type: 'array',
        items: { $ref: '#/components/schemas/NordigenTransactionDto' },
      },
    },
  })
  transactions: {
    booked: NordigenTransactionDto[];
    pending: NordigenTransactionDto[];
  };
}

export class NordigenTransactionDto {
  @ApiProperty()
  transactionId: string;
  @ApiProperty({ type: String, format: 'date' })
  bookingDate: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  bookingDateTime: Date;
  @ApiProperty({ type: Object })
  transactionAmount: TransactionAmountDto;
  @ApiProperty()
  proprietaryBankTransactionCode: string;
  @ApiProperty()
  remittanceInformationUnstructured: string;

  @ApiProperty({ required: false, type: Object })
  debtorAccount?: ExternalAccountDto;
  @ApiProperty({ required: false })
  debtorName?: string;
  @ApiProperty({ required: false, type: Object })
  creditorAccount?: ExternalAccountDto;
  @ApiProperty({ required: false })
  creditorName?: string;
  @ApiProperty({ required: false, type: Object })
  currencyExchange?: CurrencyExchangeDto;
  @ApiProperty({ required: false })
  entryReference?: string;
  @ApiProperty({ required: false, type: String, format: 'date' })
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
  @ApiProperty({ type: Object })
  instructedAmount: TransactionAmountDto;
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
