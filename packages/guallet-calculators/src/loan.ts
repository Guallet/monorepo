export interface LoanCalculatorValues {
  amount: number;
  annualInterestRate: number;
  termMonths: number;
  arrangementFee: number;
}

export interface LoanPaymentRow {
  monthNumber: number;
  payment: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
}

export interface LoanSummary {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCost: number;
  payoffMonths: number;
}

export interface LoanScenarioResult {
  summary: LoanSummary;
  schedule: LoanPaymentRow[];
}

function shiftDecimal(value: number, places: number): number {
  const [mantissa, exponent = '0'] = String(value).split('e');
  return Number(`${mantissa}e${Number(exponent) + places}`);
}

function roundCurrency(value: number, decimalPlaces: number): number {
  return shiftDecimal(
    Math.round(shiftDecimal(value, decimalPlaces)),
    -decimalPlaces,
  );
}

export function normalizeLoanValues(
  values: LoanCalculatorValues,
): LoanCalculatorValues {
  return {
    amount: Math.max(0, values.amount),
    annualInterestRate: Math.max(0, values.annualInterestRate),
    termMonths: Math.max(1, Math.round(values.termMonths)),
    arrangementFee: Math.max(0, values.arrangementFee),
  };
}

export function calculateMonthlyPayment(
  amount: number,
  annualInterestRate: number,
  termMonths: number,
  decimalPlaces = 2,
): number {
  if (amount <= 0 || termMonths <= 0) return 0;

  if (annualInterestRate === 0) {
    return roundCurrency(amount / termMonths, decimalPlaces);
  }

  const r = annualInterestRate / 100 / 12;
  const payment = (amount * r) / (1 - Math.pow(1 + r, -termMonths));
  return roundCurrency(payment, decimalPlaces);
}

export function isLoanAmortizing(
  amount: number,
  annualInterestRate: number,
  termMonths: number,
  decimalPlaces = 2,
): boolean {
  if (amount <= 0 || termMonths <= 0) return false;
  const monthlyPayment = calculateMonthlyPayment(
    amount,
    annualInterestRate,
    termMonths,
    decimalPlaces,
  );
  const firstMonthInterest = roundCurrency(
    (amount * annualInterestRate) / 1200,
    decimalPlaces,
  );
  return monthlyPayment > firstMonthInterest;
}

export function calculateLoanSchedule(
  values: LoanCalculatorValues,
  decimalPlaces = 2,
): LoanScenarioResult {
  const normalized = normalizeLoanValues(values);
  const { amount, annualInterestRate, termMonths, arrangementFee } = normalized;

  if (amount === 0) {
    return {
      summary: {
        monthlyPayment: 0,
        totalPaid: 0,
        totalInterest: 0,
        totalCost: arrangementFee,
        payoffMonths: 0,
      },
      schedule: [],
    };
  }

  const monthlyPayment = calculateMonthlyPayment(
    amount,
    annualInterestRate,
    termMonths,
    decimalPlaces,
  );
  if (
    !isLoanAmortizing(amount, annualInterestRate, termMonths, decimalPlaces)
  ) {
    throw new RangeError(
      'The rounded monthly payment does not reduce the loan balance.',
    );
  }
  const monthlyRate = annualInterestRate / 100 / 12;

  const schedule: LoanPaymentRow[] = [];
  let balance = amount;

  for (let month = 1; month <= termMonths; month++) {
    const interestPaid = roundCurrency(balance * monthlyRate, decimalPlaces);
    const principalPaid =
      month === termMonths
        ? balance
        : roundCurrency(
            Math.min(balance, monthlyPayment - interestPaid),
            decimalPlaces,
          );
    const actualPayment = roundCurrency(
      interestPaid + principalPaid,
      decimalPlaces,
    );
    balance = roundCurrency(
      Math.max(0, balance - principalPaid),
      decimalPlaces,
    );

    schedule.push({
      monthNumber: month,
      payment: actualPayment,
      interestPaid,
      principalPaid,
      remainingBalance: balance,
    });

    if (balance === 0) break;
  }

  const totalPaid = roundCurrency(
    schedule.reduce((sum, row) => sum + row.payment, 0),
    decimalPlaces,
  );
  const totalInterest = roundCurrency(totalPaid - amount, decimalPlaces);
  const totalCost = roundCurrency(totalPaid + arrangementFee, decimalPlaces);

  return {
    summary: {
      monthlyPayment,
      totalPaid,
      totalInterest,
      totalCost,
      payoffMonths: schedule.length,
    },
    schedule,
  };
}
