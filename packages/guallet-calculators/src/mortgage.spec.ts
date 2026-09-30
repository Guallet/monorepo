import { describe, expect, it } from 'vitest';
import { Currency } from '@guallet/money';
import {
  buildBalanceComparison,
  buildYearlyBreakdown,
  calculateMortgageScenario,
  normalizeMortgageValues,
  type MortgageCalculatorValues,
} from './mortgage';

const values: MortgageCalculatorValues = {
  principal: 250_000,
  propertyValue: 350_000,
  annualInterestRate: 4.75,
  termYears: 25,
  monthlyOverpayment: 200,
  oneOffOverpayment: 0,
  oneOffOverpaymentMonth: null,
};

function baseline() {
  return calculateMortgageScenario(values, {
    monthlyOverpayment: 0,
    oneOffOverpayment: 0,
    oneOffOverpaymentMonth: null,
  });
}

describe('mortgage calculations shared by web and mobile', () => {
  it('keeps the scheduled payment while overpayments shorten the term', () => {
    const base = baseline();
    const extra = calculateMortgageScenario(values);

    expect(base.summary.scheduledMonthlyPayment).toBe(1425.3);
    expect(extra.summary.scheduledMonthlyPayment).toBe(
      base.summary.scheduledMonthlyPayment,
    );
    expect(base.summary.payoffMonths).toBe(300);
    expect(extra.summary.payoffMonths).toBeLessThan(base.summary.payoffMonths);
    expect(extra.summary.totalInterest).toBeLessThan(
      base.summary.totalInterest,
    );
    expect(extra.schedule.at(-1)?.remainingBalance).toBe(0);
  });

  it('applies a one-off payment in the selected month only', () => {
    const scenario = calculateMortgageScenario({
      ...values,
      monthlyOverpayment: 0,
      oneOffOverpayment: 10_000,
      oneOffOverpaymentMonth: 12,
    });
    expect(scenario.schedule[10].extraPaid).toBe(0);
    expect(scenario.schedule[11].extraPaid).toBe(10_000);
    expect(scenario.schedule[12].extraPaid).toBe(0);
    expect(scenario.summary.totalInterest).toBeLessThan(
      baseline().summary.totalInterest,
    );
  });

  it('handles a zero-rate repayment and zero balance', () => {
    const zeroRate = calculateMortgageScenario({
      ...values,
      principal: 1200,
      annualInterestRate: 0,
      termYears: 1,
      monthlyOverpayment: 0,
    });
    expect(zeroRate.summary.scheduledMonthlyPayment).toBe(100);
    expect(zeroRate.summary.totalInterest).toBe(0);
    expect(zeroRate.summary.payoffMonths).toBe(12);
    expect(
      calculateMortgageScenario({ ...values, principal: 0 }).summary
        .payoffMonths,
    ).toBe(0);
  });

  it('absorbs a rounding residue in the final scheduled month', () => {
    const scenario = calculateMortgageScenario({
      ...values,
      annualInterestRate: 4.01,
      termYears: 30,
      monthlyOverpayment: 0,
    });

    expect(scenario.summary.payoffMonths).toBe(360);
    expect(scenario.schedule.at(-1)?.remainingBalance).toBe(0);
    expect(scenario.schedule.at(-1)?.totalPaid).toBeCloseTo(
      scenario.summary.scheduledMonthlyPayment,
      0,
    );
  });

  it('settles a one-cent final balance on a small mortgage', () => {
    const scenario = calculateMortgageScenario({
      ...values,
      principal: 10,
      annualInterestRate: 8,
      termYears: 1,
      monthlyOverpayment: 0,
    });

    expect(scenario.summary.payoffMonths).toBe(12);
    expect(scenario.schedule.at(-1)?.remainingBalance).toBe(0);
  });

  it('uses the selected currency minor unit throughout the schedule', () => {
    const inputs = {
      ...values,
      principal: 12,
      annualInterestRate: 0,
      termYears: 1,
      monthlyOverpayment: 0,
    };
    const jpy = calculateMortgageScenario(
      inputs,
      undefined,
      Currency.fromISOCode('JPY'),
    );
    const kwd = calculateMortgageScenario(
      { ...inputs, principal: 12.006 },
      undefined,
      Currency.fromISOCode('KWD'),
    );

    expect(jpy.summary.scheduledMonthlyPayment).toBe(1);
    expect(jpy.schedule[0].totalPaid).toBe(1);
    expect(kwd.summary.scheduledMonthlyPayment).toBe(1.001);
    expect(kwd.schedule[0].totalPaid).toBe(1.001);
  });

  it('keeps chart and annual totals aligned with the schedule', () => {
    const base = baseline();
    const extra = calculateMortgageScenario(values);
    const comparison = buildBalanceComparison(base, extra, values.principal);
    const annual = buildYearlyBreakdown(extra.schedule);

    expect(comparison[0]).toEqual({
      period: 'Start',
      baseline: values.principal,
      repayment: values.principal,
    });
    expect(comparison.at(-1)?.baseline).toBe(0);
    expect(comparison.at(-1)?.repayment).toBe(0);
    expect(annual[0].principal + annual[0].extra).toBeCloseTo(
      extra.schedule[11].cumulativePrincipal,
      2,
    );
    expect(annual.at(-1)?.remainingBalance).toBe(0);
  });

  it('normalizes negative and non-finite inputs as the web model did', () => {
    expect(
      normalizeMortgageValues({
        ...values,
        principal: -50,
        propertyValue: Number.POSITIVE_INFINITY,
        termYears: 0,
      }),
    ).toMatchObject({ principal: 0, propertyValue: 0, termYears: 1 });
  });
});
