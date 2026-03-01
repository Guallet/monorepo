export interface CurrentAccountProperties {
  details: {
    accountNumber: string;
    sortCode: string;
  };
  overdraft: number | null;
}

export interface CreditCardProperties {
  accountNumber: string;
  interestRate: number;
  creditLimit: number;
  cycleDay: number | string;
}

export interface SavingAccountProperties {
  interestRate: number;
}

export interface MortgageAccountProperties {
  propertyValue: number;
  mortgageAmount: number;
  interestRate: number;
  termLength: number;
}

export interface LoanAccountProperties {
  loanAmount: number;
  interestRate: number;
  termLength: number;
}
