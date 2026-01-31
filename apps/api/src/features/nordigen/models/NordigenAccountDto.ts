import { ExternalCashAccountType1Code } from './ExternalCashAccountType1Code.helper';

export class NordigenAccountDetailsDto {
  account: NordigenAccountDto;
}

export class NordigenAccountDto {
  id?: string;

  /**
   * Inner Nordigen Account Resource ID
   * This is NOT the account ID
   */
  resourceId: string;

  /**
   * The account iban
   */
  iban?: string;

  /**
   * The account bban.
   */
  bban?: string;

  /**
   * The account currency code
   */
  currency: string;

  /**
   * The account owner name
   */
  ownerName: string;

  /**
   * The account name
   */
  name?: string;

  /**
   * The account BIC.
   */
  bic?: string;

  /**
   * The Account Status
   */
  status: string;

  /**
   * The account type
   */
  cashAccountType?: ExternalCashAccountType1Code;

  /**
   * Masked Pan of the account.
   * For Credit cards
   */
  maskedPan?: string;

  /**
   * The account details
   */
  details: string;
}

export class NordigenAccountMetadataDto {
  id: string;
  created: Date;
  last_accessed: Date;
  iban: string;
  institution_id: string;
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
