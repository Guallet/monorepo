import { ApiProperty } from '@nestjs/swagger';
import { ExternalCashAccountType1Code } from './ExternalCashAccountType1Code.helper';

export class NordigenAccountBalancesDto {
  @ApiProperty({ type: () => [NordigenAccountBalanceDto] })
  balances: NordigenAccountBalanceDto[];
}

export class NordigenAccountBalanceDto {
  @ApiProperty({ type: () => NordigenBalanceDto })
  balanceAmount: NordigenBalanceSchema;
  @ApiProperty({
    enum: [
      'closingBooked',
      'expected',
      'forwardAvailable',
      'interimAvailable',
      'interimBooked',
      'nonInvoiced',
      'openingBooked',
    ],
  })
  balanceType: BalanceTypeDto;
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  referenceDate?: Date;
}
type NordigenBalanceSchema = NordigenBalanceDto;
export class NordigenBalanceDto {
  @ApiProperty()
  amount: string;
  @ApiProperty()
  currency: string;
}

/**
 * https://nordigen.com/en/docs/account-information/output/balance/
 * @enum
 */
export enum BalanceTypeDto {
  /**
   * Balance of the account at the end of the pre-agreed account reporting period.
   * It is the sum of the opening booked balance at the beginning of the period and all
   * entries booked to the account during the pre-agreed account reporting period.
   *
   * For card-accounts, this is composed of
   * - invoiced, but not yet paid entries
   */
  CLOSING_BOOKED = 'closingBooked',

  /**
   * Balance composed of booked entries and pending items known at the time of calculation,
   * which projects the end of day balance if everything is booked on the account and no other entry is posted.
   *
   * - invoiced, but not yet paid entries,
   * - not yet invoiced but already booked entries and
   * - pending items (not yet booked)
   */
  EXPECTED = 'expected',

  /**
   * Forward available balance of money that is at the disposal of the account owner on the date specified.
   */
  FORWARD_AVAILABLE = 'forwardAvailable',

  /**
   * Available balance calculated in the course of the account ’servicer’s business day,
   * at the time specified, and subject to further changes during the business day.
   * The interim balance is calculated on the basis of booked credit and debit items during
   * the calculation time/period specified.
   *
   * For card-accounts, this is composed of
   *
   * - invoiced, but not yet paid entries,
   * - not yet invoiced but already booked entries
   */
  INTERIM_AVAILABLE = 'interimAvailable',

  /**
   * Balance calculated in the course of the account servicer's business day, at the time specified,
   * and subject to further changes during the business day.
   * The interim balance is calculated on the basis of booked credit and debit items during the
   * calculation time/period specified.
   */
  INTERIM_BOOKED = 'interimBooked',

  /**
   * Only for card accounts, to be defined yet.
   */
  NON_INVOICED = 'nonInvoiced',

  /**
   * Book balance of the account at the beginning of the account reporting period.
   * It always equals the closing book balance from the previous report.
   */
  OPENING_BOOKED = 'openingBooked',
}

type NordigenAccountSchema = NordigenAccountDto;

export class NordigenAccountDetailsDto {
  @ApiProperty({ type: () => NordigenAccountDto })
  account: NordigenAccountSchema;
}

export class NordigenAccountDto {
  @ApiProperty({ required: false })
  id?: string;

  /**
   * Inner Nordigen Account Resource ID
   * This is NOT the account ID
   */
  @ApiProperty({ required: false })
  resourceId?: string;

  /**
   * The account iban
   */
  @ApiProperty({ required: false })
  iban?: string;

  /**
   * The account bban.
   */
  @ApiProperty({ required: false })
  bban?: string;

  /**
   * The account currency code
   */
  @ApiProperty()
  currency: string;

  /**
   * The account owner name
   */
  @ApiProperty({ required: false })
  ownerName?: string;

  /**
   * The account name
   */
  @ApiProperty({ required: false })
  name?: string;

  /**
   * The account BIC.
   */
  @ApiProperty({ required: false })
  bic?: string;

  /**
   * The Account Status
   */
  @ApiProperty({ required: false })
  status?: string;

  /**
   * The account type
   */
  @ApiProperty({
    required: false,
    enum: [
      'CACC',
      'CARD',
      'CASH',
      'CHAR',
      'CISH',
      'COMM',
      'CPAC',
      'LLSV',
      'LOAN',
      'MGLD',
      'MOMA',
      'NREX',
      'ODFT',
      'ONDP',
      'OTHR',
      'SACC',
      'SLRY',
      'SVGS',
      'TAXE',
      'TRAN',
      'TRAS',
      'VACC',
      'NFCA',
      'UNKNOWN',
    ],
  })
  cashAccountType?: ExternalCashAccountType1Code;

  /**
   * Masked Pan of the account.
   * For Credit cards
   */
  @ApiProperty({ required: false })
  maskedPan?: string;

  /**
   * The account details
   */
  @ApiProperty({ required: false })
  details?: string;
}
