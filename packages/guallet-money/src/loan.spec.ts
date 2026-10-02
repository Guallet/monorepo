import { describe, expect, it } from 'vitest';
import {
  calculateLoanSchedule,
  calculateMonthlyPayment,
  normalizeLoanValues,
} from './loan';

describe('loan calculations shared by web and mobile', () => {
  it('matches the web calculator defaults and month-by-month rounding', () => {
    const loanA = calculateLoanSchedule({
      amount: 10000,
      annualInterestRate: 6.9,
      termMonths: 60,
      arrangementFee: 0,
    });
    expect(loanA.summary).toEqual({
      monthlyPayment: 197.54,
      totalPaid: 11852.46,
      totalInterest: 1852.46,
      totalCost: 11852.46,
      payoffMonths: 60,
    });
    expect(loanA.schedule[0]).toEqual({
      monthNumber: 1,
      payment: 197.54,
      interestPaid: 57.5,
      principalPaid: 140.04,
      remainingBalance: 9859.96,
    });
    expect(loanA.schedule.at(-1)).toEqual({
      monthNumber: 60,
      payment: 197.6,
      interestPaid: 1.13,
      principalPaid: 196.47,
      remainingBalance: 0,
    });
    const loanB = calculateLoanSchedule({
      amount: 10000,
      annualInterestRate: 8.5,
      termMonths: 48,
      arrangementFee: 150,
    });
    expect(loanB.summary.totalCost).toBe(11981.18);
    expect(loanB.summary.totalCost - loanA.summary.totalCost).toBeCloseTo(
      128.72,
    );
  });

  it('handles zero interest and an upfront fee', () => {
    expect(calculateMonthlyPayment(1200, 0, 12)).toBe(100);
    const result = calculateLoanSchedule({
      amount: 1200,
      annualInterestRate: 0,
      termMonths: 12,
      arrangementFee: 25,
    });
    expect(result.summary).toEqual({
      monthlyPayment: 100,
      totalPaid: 1200,
      totalInterest: 0,
      totalCost: 1225,
      payoffMonths: 12,
    });
    expect(result.schedule.at(-1)?.remainingBalance).toBe(0);
  });

  it('normalizes lower bounds consistently with the web behaviour', () => {
    expect(
      normalizeLoanValues({
        amount: -1,
        annualInterestRate: -5,
        termMonths: 0,
        arrangementFee: -3,
      }),
    ).toEqual({
      amount: 0,
      annualInterestRate: 0,
      termMonths: 1,
      arrangementFee: 0,
    });
    expect(calculateMonthlyPayment(0, 5, 12)).toBe(0);
    expect(calculateMonthlyPayment(100, 5, 0)).toBe(0);
    expect(
      calculateLoanSchedule({
        amount: 0,
        annualInterestRate: 0,
        termMonths: 0,
        arrangementFee: 5,
      }),
    ).toEqual({
      summary: {
        monthlyPayment: 0,
        totalPaid: 0,
        totalInterest: 0,
        totalCost: 5,
        payoffMonths: 0,
      },
      schedule: [],
    });
  });
});
