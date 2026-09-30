import {
  calculateMonthlyPayment,
  type LoanCalculatorValues,
} from '@guallet/calculators';

export type LoanField = keyof LoanCalculatorValues;
export type LoanInput = Record<LoanField, string>;

export const DEFAULT_LOAN_A: LoanInput = {
  amount: '10000',
  annualInterestRate: '6.9',
  termMonths: '60',
  arrangementFee: '0',
};

export const DEFAULT_LOAN_B: LoanInput = {
  amount: '10000',
  annualInterestRate: '8.5',
  termMonths: '48',
  arrangementFee: '150',
};

export function parseLoanInput(input: LoanInput): {
  values: LoanCalculatorValues | null;
  errors: Partial<Record<LoanField, string>>;
} {
  const errors: Partial<Record<LoanField, string>> = {};
  const raw = (field: LoanField) => input[field].trim().replace(',', '.');
  const parse = (field: LoanField) => {
    const value = raw(field);
    if (value === '' || !/^\d+(\.\d{1,2})?$/.test(value)) return NaN;
    return Number(value);
  };
  const amount = parse('amount');
  const annualInterestRate = parse('annualInterestRate');
  const termMonths = parse('termMonths');
  const arrangementFee = parse('arrangementFee');

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000_000) {
    errors.amount = 'Enter an amount greater than zero and up to one trillion.';
  }
  if (
    !Number.isFinite(annualInterestRate) ||
    annualInterestRate < 0 ||
    annualInterestRate > 100
  ) {
    errors.annualInterestRate = 'Use a rate between 0% and 100%.';
  }
  if (!Number.isSafeInteger(termMonths) || termMonths < 1 || termMonths > 600) {
    errors.termMonths = 'Choose 1 to 600 whole months.';
  }
  if (
    !Number.isFinite(arrangementFee) ||
    arrangementFee < 0 ||
    arrangementFee > 1_000_000_000_000
  ) {
    errors.arrangementFee = 'Enter a fee from zero to one trillion.';
  }
  if (
    !errors.amount &&
    !errors.annualInterestRate &&
    !errors.termMonths &&
    calculateMonthlyPayment(amount, annualInterestRate, termMonths) === 0
  ) {
    errors.amount =
      'Increase the amount or shorten the term to produce a monthly payment.';
  }
  if (!errors.amount && !errors.annualInterestRate && !errors.termMonths) {
    const payment = calculateMonthlyPayment(
      amount,
      annualInterestRate,
      termMonths,
    );
    const firstMonthInterest =
      Math.round((amount * annualInterestRate * 100) / 1200) / 100;
    if (payment <= firstMonthInterest) {
      errors.amount =
        'Increase the amount or shorten the term so the balance can fall.';
    }
  }
  if (Object.keys(errors).length > 0) return { values: null, errors };
  return {
    values: { amount, annualInterestRate, termMonths, arrangementFee },
    errors,
  };
}
