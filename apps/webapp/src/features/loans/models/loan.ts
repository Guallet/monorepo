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

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
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
): number {
  if (amount <= 0 || termMonths <= 0) return 0;

  if (annualInterestRate === 0) {
    return roundCurrency(amount / termMonths);
  }

  const r = annualInterestRate / 100 / 12;
  const payment = (amount * r) / (1 - Math.pow(1 + r, -termMonths));
  return roundCurrency(payment);
}

export function calculateLoanSchedule(
  values: LoanCalculatorValues,
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
  );
  const monthlyRate = annualInterestRate / 100 / 12;

  const schedule: LoanPaymentRow[] = [];
  let balance = amount;

  for (let month = 1; month <= termMonths; month++) {
    const interestPaid = roundCurrency(balance * monthlyRate);
    const principalPaid = roundCurrency(
      Math.min(balance, monthlyPayment - interestPaid),
    );
    const actualPayment = roundCurrency(interestPaid + principalPaid);
    balance = roundCurrency(Math.max(0, balance - principalPaid));

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
  );
  const totalInterest = roundCurrency(totalPaid - amount);
  const totalCost = roundCurrency(totalPaid + arrangementFee);

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
