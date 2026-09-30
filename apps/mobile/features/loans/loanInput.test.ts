import { describe, expect, it } from 'vitest';
import { DEFAULT_LOAN_A, parseLoanInput } from './loanInput';

describe('loan input validation', () => {
  it('accepts valid values and decimal commas', () => {
    expect(
      parseLoanInput({ ...DEFAULT_LOAN_A, annualInterestRate: '6,9' }).values,
    ).toEqual({
      amount: 10000,
      annualInterestRate: 6.9,
      termMonths: 60,
      arrangementFee: 0,
    });
  });

  it('rejects empty, negative, out-of-range, and fractional terms', () => {
    const result = parseLoanInput({
      amount: '',
      annualInterestRate: '101',
      termMonths: '1.5',
      arrangementFee: '-1',
    });
    expect(result.values).toBeNull();
    expect(Object.keys(result.errors)).toHaveLength(4);
    expect(
      parseLoanInput({ ...DEFAULT_LOAN_A, termMonths: '600' }).values
        ?.termMonths,
    ).toBe(600);
    expect(
      parseLoanInput({ ...DEFAULT_LOAN_A, termMonths: '601' }).errors
        .termMonths,
    ).toBeDefined();
    expect(
      parseLoanInput({ ...DEFAULT_LOAN_A, amount: '1000000000001' }).errors
        .amount,
    ).toBeDefined();
    expect(
      parseLoanInput({ ...DEFAULT_LOAN_A, arrangementFee: '1000000000001' })
        .errors.arrangementFee,
    ).toBeDefined();
    expect(
      parseLoanInput({ ...DEFAULT_LOAN_A, amount: '0.01', termMonths: '600' })
        .errors.amount,
    ).toBeDefined();
    expect(
      parseLoanInput({ ...DEFAULT_LOAN_A, amount: '1.234' }).errors.amount,
    ).toBeDefined();
    expect(
      parseLoanInput({
        amount: '1',
        annualInterestRate: '100',
        termMonths: '600',
        arrangementFee: '0',
      }).errors.amount,
    ).toBeDefined();
  });

  it('validates amounts using the selected currency precision', () => {
    expect(
      parseLoanInput({ ...DEFAULT_LOAN_A, amount: '10000.5' }, 0).errors.amount,
    ).toBeDefined();
    expect(
      parseLoanInput(
        { ...DEFAULT_LOAN_A, amount: '10000.123', arrangementFee: '0.001' },
        3,
      ).values,
    ).toEqual({
      amount: 10000.123,
      annualInterestRate: 6.9,
      termMonths: 60,
      arrangementFee: 0.001,
    });
  });
});
