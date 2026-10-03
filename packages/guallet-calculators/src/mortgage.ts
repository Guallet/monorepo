import { Currency, Money } from '@guallet/money';

const DEFAULT_CURRENCY = Currency.fromISOCode('GBP');

export interface MortgageCalculatorValues {
  principal: number;
  propertyValue: number | null;
  annualInterestRate: number;
  termYears: number;
  monthlyOverpayment: number;
  oneOffOverpayment: number;
  oneOffOverpaymentMonth: number | null;
}

export interface MortgagePaymentRow {
  monthNumber: number;
  yearNumber: number;
  scheduledPayment: number;
  interestPaid: number;
  principalPaid: number;
  extraPaid: number;
  totalPaid: number;
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface MortgageScenarioSummary {
  scheduledMonthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  payoffMonths: number;
}

export interface MortgageScenarioResult {
  schedule: MortgagePaymentRow[];
  summary: MortgageScenarioSummary;
}

export interface MortgageYearlyBreakdownRow {
  year: string;
  interest: number;
  principal: number;
  extra: number;
  remainingBalance: number;
}

export interface MortgageBalanceComparisonRow {
  period: string;
  baseline: number;
  repayment: number;
}

interface ScenarioOverrides {
  monthlyOverpayment?: number;
  oneOffOverpayment?: number;
  oneOffOverpaymentMonth?: number | null;
}

function roundCurrency(value: number, currency: Currency): number {
  return Money.from({ amount: value, currency }).round().amount;
}

function sanitizePositiveNumber(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function sanitizePositiveInteger(value: number | null | undefined): number {
  return Math.round(sanitizePositiveNumber(value));
}

export function normalizeMortgageValues(
  values: MortgageCalculatorValues,
): MortgageCalculatorValues {
  return {
    principal: sanitizePositiveNumber(values.principal),
    propertyValue:
      values.propertyValue == null
        ? null
        : sanitizePositiveNumber(values.propertyValue),
    annualInterestRate: sanitizePositiveNumber(values.annualInterestRate),
    termYears: Math.max(1, sanitizePositiveInteger(values.termYears)),
    monthlyOverpayment: sanitizePositiveNumber(values.monthlyOverpayment),
    oneOffOverpayment: sanitizePositiveNumber(values.oneOffOverpayment),
    oneOffOverpaymentMonth:
      values.oneOffOverpaymentMonth == null
        ? null
        : Math.max(1, sanitizePositiveInteger(values.oneOffOverpaymentMonth)),
  };
}

function calculateScheduledPayment(
  principal: number,
  monthlyInterestRate: number,
  totalMonths: number,
  currency: Currency,
): number {
  if (principal <= 0 || totalMonths <= 0) {
    return 0;
  }

  if (monthlyInterestRate === 0) {
    return Money.from({ amount: principal / totalMonths, currency }).round(
      undefined,
      'UP',
    ).amount;
  }

  const numerator = principal * monthlyInterestRate;
  const denominator = 1 - Math.pow(1 + monthlyInterestRate, -totalMonths);

  // Rounding down one minor unit can leave a balance after the requested term.
  return Money.from({ amount: numerator / denominator, currency }).round(
    undefined,
    'UP',
  ).amount;
}

function getBalanceAtMonth(
  schedule: MortgagePaymentRow[],
  month: number,
  startingBalance: number,
  currency: Currency,
): number {
  if (month <= 0) {
    return roundCurrency(startingBalance, currency);
  }

  const row = schedule[Math.min(month, schedule.length) - 1];
  return roundCurrency(row?.remainingBalance ?? 0, currency);
}

export function calculateMortgageScenario(
  values: MortgageCalculatorValues,
  overrides?: ScenarioOverrides,
  currency: Currency = DEFAULT_CURRENCY,
): MortgageScenarioResult {
  const normalized = normalizeMortgageValues(values);
  const principal = normalized.principal;
  const totalMonths = normalized.termYears * 12;
  const monthlyInterestRate = normalized.annualInterestRate / 100 / 12;
  const monthlyOverpayment = sanitizePositiveNumber(
    overrides?.monthlyOverpayment ?? normalized.monthlyOverpayment,
  );
  const oneOffOverpayment = sanitizePositiveNumber(
    overrides?.oneOffOverpayment ?? normalized.oneOffOverpayment,
  );
  const oneOffOverpaymentMonth =
    overrides?.oneOffOverpaymentMonth ?? normalized.oneOffOverpaymentMonth;

  const scheduledPayment = calculateScheduledPayment(
    principal,
    monthlyInterestRate,
    totalMonths,
    currency,
  );

  if (principal <= 0 || totalMonths <= 0) {
    return {
      schedule: [],
      summary: {
        scheduledMonthlyPayment: scheduledPayment,
        totalInterest: 0,
        totalPaid: 0,
        payoffMonths: 0,
      },
    };
  }

  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  const schedule: MortgagePaymentRow[] = [];
  // Allow at most one minor unit of accumulated interest rounding per month,
  // capped at 1% of the scheduled payment to avoid a large final payment.
  const minorUnit = 10 ** -currency.decimalPlaces;
  const roundingTolerance = Math.max(
    minorUnit,
    Math.min(totalMonths * minorUnit, scheduledPayment * 0.01),
  );

  for (
    let monthNumber = 1;
    monthNumber <= totalMonths + 1_200;
    monthNumber += 1
  ) {
    if (balance <= 0) {
      break;
    }

    const interestPaid = roundCurrency(balance * monthlyInterestRate, currency);
    const scheduledPrincipalTarget = Math.max(
      0,
      scheduledPayment - interestPaid,
    );
    let principalPaid = Math.min(
      balance,
      roundCurrency(scheduledPrincipalTarget, currency),
    );
    // Absorb only the rounding residue at the end of the selected term.
    if (
      monthNumber === totalMonths &&
      roundCurrency(balance - principalPaid, currency) <= roundingTolerance
    ) {
      principalPaid = balance;
    }
    const extraRequested = roundCurrency(
      monthlyOverpayment +
        (oneOffOverpaymentMonth === monthNumber ? oneOffOverpayment : 0),
      currency,
    );
    const extraPaid = Math.min(
      roundCurrency(balance - principalPaid, currency),
      extraRequested,
    );
    const totalPrincipalPaid = roundCurrency(
      principalPaid + extraPaid,
      currency,
    );
    const totalPaid = roundCurrency(
      interestPaid + totalPrincipalPaid,
      currency,
    );

    balance = roundCurrency(
      Math.max(0, balance - totalPrincipalPaid),
      currency,
    );
    cumulativeInterest = roundCurrency(
      cumulativeInterest + interestPaid,
      currency,
    );
    cumulativePrincipal = roundCurrency(
      cumulativePrincipal + totalPrincipalPaid,
      currency,
    );

    schedule.push({
      monthNumber,
      yearNumber: Math.ceil(monthNumber / 12),
      scheduledPayment,
      interestPaid,
      principalPaid,
      extraPaid,
      totalPaid,
      remainingBalance: balance,
      cumulativeInterest,
      cumulativePrincipal,
    });
  }

  const totalPaid = roundCurrency(
    cumulativeInterest + cumulativePrincipal,
    currency,
  );

  return {
    schedule,
    summary: {
      scheduledMonthlyPayment: scheduledPayment,
      totalInterest: cumulativeInterest,
      totalPaid,
      payoffMonths: schedule.length,
    },
  };
}

export function buildYearlyBreakdown(
  schedule: MortgagePaymentRow[],
  currency: Currency = DEFAULT_CURRENCY,
): MortgageYearlyBreakdownRow[] {
  const grouped = new Map<number, MortgageYearlyBreakdownRow>();

  for (const row of schedule) {
    const existing = grouped.get(row.yearNumber);

    if (existing) {
      existing.interest = roundCurrency(
        existing.interest + row.interestPaid,
        currency,
      );
      existing.principal = roundCurrency(
        existing.principal + row.principalPaid,
        currency,
      );
      existing.extra = roundCurrency(existing.extra + row.extraPaid, currency);
      existing.remainingBalance = row.remainingBalance;
      continue;
    }

    grouped.set(row.yearNumber, {
      year: `Y${row.yearNumber}`,
      interest: row.interestPaid,
      principal: row.principalPaid,
      extra: row.extraPaid,
      remainingBalance: row.remainingBalance,
    });
  }

  return [...grouped.values()];
}

export function buildBalanceComparison(
  baseline: MortgageScenarioResult,
  repayment: MortgageScenarioResult,
  principal: number,
  currency: Currency = DEFAULT_CURRENCY,
): MortgageBalanceComparisonRow[] {
  const maxMonths = Math.max(
    baseline.summary.payoffMonths,
    repayment.summary.payoffMonths,
  );
  const maxYear = Math.ceil(maxMonths / 12);
  const data: MortgageBalanceComparisonRow[] = [
    {
      period: 'Start',
      baseline: roundCurrency(principal, currency),
      repayment: roundCurrency(principal, currency),
    },
  ];

  for (let year = 1; year <= maxYear; year += 1) {
    const month = year * 12;
    data.push({
      period: `Year ${year}`,
      baseline: getBalanceAtMonth(
        baseline.schedule,
        month,
        principal,
        currency,
      ),
      repayment: getBalanceAtMonth(
        repayment.schedule,
        month,
        principal,
        currency,
      ),
    });
  }

  return data;
}
