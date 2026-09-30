import {
  calculateMortgageScenario,
  type MortgageCalculatorValues,
} from '@guallet/calculators';

export type MortgageField = keyof MortgageCalculatorValues;
export type MortgageInput = Record<MortgageField, string>;

export const DEFAULT_MORTGAGE_INPUT: MortgageInput = {
  principal: '250,000',
  propertyValue: '350,000',
  annualInterestRate: '4.75',
  termYears: '25',
  monthlyOverpayment: '200',
  oneOffOverpayment: '0',
  oneOffOverpaymentMonth: '12',
};

const MAX_AMOUNT = 1_000_000_000_000;

function parseNumber(text: string, places: number): number {
  const trimmed = text.trim();
  const integerPattern = /^(?:\d+|\d{1,3}(?:,\d{3})+)$/;
  const pattern =
    places === 0
      ? integerPattern
      : new RegExp(
          String.raw`^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,${places}})?$`,
        );
  if (!pattern.test(trimmed)) {
    return Number.NaN;
  }
  return Number(trimmed.replaceAll(',', ''));
}

export function parseMortgageInput(input: MortgageInput): {
  values: MortgageCalculatorValues | null;
  errors: Partial<Record<MortgageField, string>>;
} {
  const errors: Partial<Record<MortgageField, string>> = {};
  const principal = parseNumber(input.principal, 2);
  const propertyValue =
    input.propertyValue.trim() === ''
      ? null
      : parseNumber(input.propertyValue, 2);
  const annualInterestRate = parseNumber(input.annualInterestRate, 3);
  const termYears = parseNumber(input.termYears, 0);
  const monthlyOverpayment = parseNumber(input.monthlyOverpayment, 2);
  const oneOffOverpayment = parseNumber(input.oneOffOverpayment, 2);
  const oneOffOverpaymentMonth =
    input.oneOffOverpaymentMonth.trim() === ''
      ? null
      : parseNumber(input.oneOffOverpaymentMonth, 0);

  if (!Number.isFinite(principal) || principal <= 0 || principal > MAX_AMOUNT) {
    errors.principal =
      'Enter a balance greater than zero and up to one trillion.';
  }
  if (
    propertyValue !== null &&
    (!Number.isFinite(propertyValue) ||
      propertyValue <= 0 ||
      propertyValue > MAX_AMOUNT)
  ) {
    errors.propertyValue =
      'Enter a positive property value, or leave it blank.';
  }
  if (
    !Number.isFinite(annualInterestRate) ||
    annualInterestRate < 0 ||
    annualInterestRate > 100
  ) {
    errors.annualInterestRate = 'Use an annual rate from 0% to 100%.';
  }
  if (!Number.isSafeInteger(termYears) || termYears < 1 || termYears > 50) {
    errors.termYears = 'Choose 1 to 50 whole years.';
  }
  if (
    !Number.isFinite(monthlyOverpayment) ||
    monthlyOverpayment < 0 ||
    monthlyOverpayment > MAX_AMOUNT
  ) {
    errors.monthlyOverpayment = 'Enter zero or a positive monthly amount.';
  }
  if (
    !Number.isFinite(oneOffOverpayment) ||
    oneOffOverpayment < 0 ||
    oneOffOverpayment > MAX_AMOUNT
  ) {
    errors.oneOffOverpayment = 'Enter zero or a positive one-off amount.';
  }
  if (
    oneOffOverpayment > 0 &&
    oneOffOverpaymentMonth !== null &&
    (!Number.isSafeInteger(oneOffOverpaymentMonth) ||
      oneOffOverpaymentMonth < 1 ||
      oneOffOverpaymentMonth > termYears * 12)
  ) {
    errors.oneOffOverpaymentMonth = 'Choose a month within the remaining term.';
  }
  if (oneOffOverpayment > 0 && oneOffOverpaymentMonth === null) {
    errors.oneOffOverpaymentMonth = 'Choose when to make the one-off payment.';
  }
  if (Object.keys(errors).length > 0) return { values: null, errors };

  const values: MortgageCalculatorValues = {
    principal,
    propertyValue,
    annualInterestRate,
    termYears,
    monthlyOverpayment,
    oneOffOverpayment,
    oneOffOverpaymentMonth,
  };
  const baseline = calculateMortgageScenario(values, {
    monthlyOverpayment: 0,
    oneOffOverpayment: 0,
    oneOffOverpaymentMonth: null,
  });
  if (
    baseline.schedule.at(-1)?.remainingBalance !== 0 ||
    baseline.summary.payoffMonths > termYears * 12
  ) {
    errors.principal =
      'This balance and rate cannot be repaid within the term.';
    return { values: null, errors };
  }
  return { values, errors };
}

export function mortgageInputFromParams(
  params: Partial<Record<MortgageField, string | string[]>>,
): MortgageInput {
  const read = (field: MortgageField) => {
    const value = params[field];
    return typeof value === 'string' ? value : '';
  };
  return {
    principal: read('principal'),
    propertyValue: read('propertyValue'),
    annualInterestRate: read('annualInterestRate'),
    termYears: read('termYears'),
    monthlyOverpayment: read('monthlyOverpayment'),
    oneOffOverpayment: read('oneOffOverpayment'),
    oneOffOverpaymentMonth: read('oneOffOverpaymentMonth'),
  };
}
