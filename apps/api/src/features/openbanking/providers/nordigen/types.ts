export type NordigenCredentials = {
  secretId: string;
  secretKey: string;
};

export type NordigenTokenResponse = {
  access: string;
};

export type NordigenInstitution = {
  id: string;
  name: string;
  logo: string;
};

export type NordigenAuthorizationRequest = {
  institution_id: string;
  redirect: string;
  reference: string;
};

export type NordigenAuthorizationResponse = {
  id: string;
  link: string;
};

export type NordigenAuthorization = {
  status: string;
  accounts: string[];
  agreement?: string;
};

export type NordigenAgreement = {
  accepted: string | null;
  access_valid_for_days: number;
};

export type NordigenAmount = {
  amount: string;
  currency: string;
};

export type NordigenAccountBalancesResponse = {
  balances: NordigenAccountBalance[];
};

export type NordigenAccountBalance = {
  balanceAmount: NordigenAmount;
  balanceType: NordigenBalanceType;
  referenceDate?: string;
};

/**
 * https://nordigen.com/en/docs/account-information/output/balance/
 * @enum
 */
export enum NordigenBalanceType {
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

export enum ExternalCashAccountType1Code {
  CURRENT_ACCOUNT = 'CACC',
  CREDIT_CARD_ACCOUNT = 'CARD',
  CASH = 'CASH',
  CHARGES = 'CHAR',
  CASH_INCOME = 'CISH',
  COMISSION = 'COMM',
  CLEARING_PARTICIPANT = 'CPAC',
  LIMITED_LIQUIDITY_SETTLEMENT = 'LLSV',
  LOAN = 'LOAN',
  MARGINAL_LENDING = 'MGLD',
  MONEY_MARKET = 'MOMA',
  NON_RESIDENT_EXTERNAL = 'NREX',
  OVERDRAFT = 'ODFT',
  OVER_NIGHT_DEPOSIT = 'ONDP',
  OTHER = 'OTHR',
  SETTLEMENT = 'SACC',
  SALARY = 'SLRY',
  SAVINGS = 'SVGS',
  TAX = 'TAXE',
  TRANSACTION = 'TRAN',
  CASH_TRADING = 'TRAS',
  VIRTUAL_ACCOUNT = 'VACC',
  NON_RESIDENT_FOREIGN_CURRENCY = 'NFCA',
  UNKNOWN = 'UNKNOWN',
}

export type NordigenAccountDetailsResponse = {
  account: NordigenAccount;
};

export type NordigenAccount = {
  id?: string;
  // Provider resource ID, distinct from the account ID.
  resourceId?: string;
  iban?: string;
  bban?: string;
  currency: string;
  ownerName?: string;
  name?: string;
  bic?: string;
  status?: string;
  cashAccountType?: ExternalCashAccountType1Code;
  maskedPan?: string;
  details?: string;
};

export type NordigenTransactionsResponse = {
  transactions: NordigenTransactionGroups;
};

export type NordigenTransactionGroups = {
  booked: NordigenTransaction[];
  pending: NordigenTransaction[];
};

export type NordigenTransaction = {
  transactionId?: string;
  bookingDate?: string;
  bookingDateTime?: string;
  transactionAmount: NordigenAmount;
  proprietaryBankTransactionCode?: string;
  remittanceInformationUnstructured?: string;
  debtorAccount?: NordigenExternalAccount;
  debtorName?: string;
  creditorAccount?: NordigenExternalAccount;
  creditorName?: string;
  currencyExchange?: NordigenCurrencyExchange;
  entryReference?: string;
  valueDate?: string;
  additionalInformation?: string | null;
};

export type NordigenExternalAccount = {
  iban: string;
};

export type NordigenCurrencyExchange = {
  exchangeRate: string;
  instructedAmount: NordigenAmount;
  sourceCurrency: string;
  targetCurrency: string;
  unitCurrency: string;
};
