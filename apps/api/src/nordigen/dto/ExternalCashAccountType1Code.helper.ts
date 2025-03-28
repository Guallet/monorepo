// ExternalCashAccountType1Code from ISO 20022
// CACC	Current	Account used to post debits and credits when no specific account has been nominated.
// CARD	CardAccount	Account used for credit card payments.
// CASH	CashPayment	Account used for the payment of cash.
// CHAR	Charges	"Account used for charges if different from the account for payment."
// CISH	CashIncome	Account used for payment of income if different from the current cash account
// COMM	Commission	"Account used for commission if different from the account for payment."
// CPAC	ClearingParticipantSettlementAccount	Account used to post settlement debit and credit entries on behalf of a designated Clearing Participant.
// LLSV	LimitedLiquiditySavingsAccount	Account used for savings with special interest and withdrawal terms.
// LOAN	Loan	Account used for loans.
// MGLD	MarginalLending	Account used for a marginal lending facility.
// MOMA	MoneyMarket	"Account used for money markets if different from the cash account."
// NREX	NonResidentExternal	Account used for non-resident external.
// ODFT	Overdraft	Account is used for overdrafts.
// ONDP	OverNightDeposit	Account used for overnight deposits.
// OTHR	OtherAccount	Account not otherwise specified.
// SACC	Settlement	Account used to post debit and credit entries, as a result of transactions cleared and settled through a specific clearing and settlement system.
// SLRY	Salary	Accounts used for salary payments.
// SVGS	Savings	Account used for savings.
// TAXE	Tax	"Account used for taxes if different from the account for payment."
// TRAN	TransactingAccount	A transacting account is the most basic type of bank account that you can get. The main difference between transaction and cheque accounts is that you usually do not get a cheque book with your transacting account and neither are you offered an overdraft facility.
// TRAS	CashTrading	"Account used for trading if different from the current cash account."
// VACC	VirtualAccount	Account created virtually to facilitate collection and reconciliation.
// NFCA	NonResidentForeignCurrencyAccount	Non-Resident Individual / Entity Foreign Current held domestically.

import { AccountType } from 'src/accounts/entities/accountType.model';

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

export function getAccountTypeFrom(
  type: ExternalCashAccountType1Code | undefined | null,
): AccountType {
  switch (type) {
    case ExternalCashAccountType1Code.CURRENT_ACCOUNT:
      return AccountType.CURRENT_ACCOUNT;
    case ExternalCashAccountType1Code.CREDIT_CARD_ACCOUNT:
      return AccountType.CREDIT_CARD;
    case ExternalCashAccountType1Code.SAVINGS:
      return AccountType.SAVINGS;
    case ExternalCashAccountType1Code.LOAN:
      return AccountType.LOAN;
    default:
      return AccountType.UNKNOWN;
  }
}
