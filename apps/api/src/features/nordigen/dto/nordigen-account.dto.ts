import { ExternalCashAccountType1Code } from './ExternalCashAccountType1Code.helper.js';
import { ApiProperty } from '@nestjs/swagger';

export class NordigenAccountMetadataDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ type: String, format: 'date-time' })
  created: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  last_accessed: Date;
  @ApiProperty()
  iban: string;
  @ApiProperty()
  institution_id: string;
  @ApiProperty({
    enum: [
      'DISCOVERED',
      'PROCESSING',
      'ERROR',
      'EXPIRED',
      'READY',
      'SUSPENDED',
    ],
  })
  status: NordigenAccountStatus;
}

export type NordigenAccountStatus =
  | 'DISCOVERED' // User has successfully authenticated and account is discovered
  | 'PROCESSING' // Account is being processed by the Institution
  | 'ERROR' // An error was encountered when processing account
  | 'EXPIRED' // Access to account has expired as set in End User Agreement
  | 'READY' // Account has been successfully processed
  | 'SUSPENDED'; // Account has been suspended (more than 10 consecutive failed attempts to access the account

// export enum NordigenAccountStatus{
//  { "DISCOVERED": "User has successfully authenticated and account is discovered" },
//  { "PROCESSING": "Account is being processed by the Institution" },
//  { "ERROR": "An error was encountered when processing account" },
//  { "EXPIRED": "Access to account has expired as set in End User Agreement" },
//  { "READY": "Account has been successfully processed" },
//  { "SUSPENDED": "Account has been suspended (more than 10 consecutive failed attempts to access the account)" } ]
// }

// Status short	Status long	Description	Stage
// CR	CREATED	Requisition has been successfully created	1
// GC	GIVING_CONSENT	End-user is giving consent at GoCardless's consent screen	2
// UA	UNDERGOING_AUTHENTICATION	End-user is redirected to the financial institution for authentication	3
// RJ	REJECTED	Either SSN verification has failed or end-user has entered incorrect credentials	4
// SA	SELECTING_ACCOUNTS	End-user is selecting accounts	5
// GA	GRANTING_ACCESS	End-user is granting access to their account information	6
// LN	LINKED	Account has been successfully linked to requisition	7
// EX	EXPIRED Access to accounts has expired as set in End User Agreement 8

export class NordigenBalanceDto {
  @ApiProperty()
  amount: string;
  @ApiProperty()
  currency: string;
}

export class NordigenAccountBalancesDto {
  @ApiProperty({ type: () => [NordigenAccountBalanceDto] })
  balances: NordigenAccountBalanceDto[];
}

export class NordigenAccountBalanceDto {
  @ApiProperty({ type: () => NordigenBalanceDto })
  balanceAmount: NordigenBalanceDto;
  @ApiProperty({
    required: false,
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
  balanceType?: string;
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  referenceDate?: Date;
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

export class NordigenAccountDto {
  @ApiProperty({ required: false })
  id?: string;

  /**
   * Inner Nordigen Account Resource ID
   * This is NOT the account ID
   */
  @ApiProperty()
  resourceId: string;

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
  @ApiProperty()
  ownerName: string;

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
  @ApiProperty()
  status: string;

  /**
   * The account type
   */
  @ApiProperty({ required: false })
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
  @ApiProperty()
  details: string;
}

export class NordigenAccountDetailsDto {
  @ApiProperty({ type: () => NordigenAccountDto })
  account: NordigenAccountDto;
}
