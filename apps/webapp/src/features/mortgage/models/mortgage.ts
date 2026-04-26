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

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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
): number {
  if (principal <= 0 || totalMonths <= 0) {
    return 0;
  }

  if (monthlyInterestRate === 0) {
    return roundCurrency(principal / totalMonths);
  }

  const numerator = principal * monthlyInterestRate;
  const denominator = 1 - Math.pow(1 + monthlyInterestRate, -totalMonths);

  return roundCurrency(numerator / denominator);
}

function getBalanceAtMonth(
  schedule: MortgagePaymentRow[],
  month: number,
  startingBalance: number,
): number {
  if (month <= 0) {
    return roundCurrency(startingBalance);
  }

  const row = schedule[Math.min(month, schedule.length) - 1];
  return roundCurrency(row?.remainingBalance ?? 0);
}

export function calculateMortgageScenario(
  values: MortgageCalculatorValues,
  overrides?: ScenarioOverrides,
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

  for (
    let monthNumber = 1;
    monthNumber <= totalMonths + 1_200;
    monthNumber += 1
  ) {
    if (balance <= 0) {
      break;
    }

    const interestPaid = roundCurrency(balance * monthlyInterestRate);
    const scheduledPrincipalTarget = Math.max(
      0,
      scheduledPayment - interestPaid,
    );
    const principalPaid = Math.min(
      balance,
      roundCurrency(scheduledPrincipalTarget),
    );
    const extraRequested = roundCurrency(
      monthlyOverpayment +
        (oneOffOverpaymentMonth === monthNumber ? oneOffOverpayment : 0),
    );
    const extraPaid = Math.min(
      roundCurrency(balance - principalPaid),
      extraRequested,
    );
    const totalPrincipalPaid = roundCurrency(principalPaid + extraPaid);
    const totalPaid = roundCurrency(interestPaid + totalPrincipalPaid);

    balance = roundCurrency(Math.max(0, balance - totalPrincipalPaid));
    cumulativeInterest = roundCurrency(cumulativeInterest + interestPaid);
    cumulativePrincipal = roundCurrency(
      cumulativePrincipal + totalPrincipalPaid,
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

  const totalPaid = roundCurrency(cumulativeInterest + cumulativePrincipal);

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
): MortgageYearlyBreakdownRow[] {
  const grouped = new Map<number, MortgageYearlyBreakdownRow>();

  for (const row of schedule) {
    const existing = grouped.get(row.yearNumber);

    if (existing) {
      existing.interest = roundCurrency(existing.interest + row.interestPaid);
      existing.principal = roundCurrency(
        existing.principal + row.principalPaid,
      );
      existing.extra = roundCurrency(existing.extra + row.extraPaid);
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
): MortgageBalanceComparisonRow[] {
  const maxMonths = Math.max(
    baseline.summary.payoffMonths,
    repayment.summary.payoffMonths,
  );
  const maxYear = Math.ceil(maxMonths / 12);
  const data: MortgageBalanceComparisonRow[] = [
    {
      period: 'Start',
      baseline: roundCurrency(principal),
      repayment: roundCurrency(principal),
    },
  ];

  for (let year = 1; year <= maxYear; year += 1) {
    const month = year * 12;
    data.push({
      period: `Year ${year}`,
      baseline: getBalanceAtMonth(baseline.schedule, month, principal),
      repayment: getBalanceAtMonth(repayment.schedule, month, principal),
    });
  }

  return data;
}
