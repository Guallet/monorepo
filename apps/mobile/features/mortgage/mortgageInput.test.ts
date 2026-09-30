import { describe, expect, it } from 'vitest';
import { DEFAULT_MORTGAGE_INPUT, parseMortgageInput } from './mortgageInput';

describe('mobile mortgage inputs', () => {
  it('accepts formatted balances and an optional property value', () => {
    const parsed = parseMortgageInput(DEFAULT_MORTGAGE_INPUT);
    expect(parsed.values?.principal).toBe(250_000);
    expect(parsed.values?.propertyValue).toBe(350_000);
    expect(parsed.errors).toEqual({});

    const noValue = parseMortgageInput({
      ...DEFAULT_MORTGAGE_INPUT,
      propertyValue: '',
    });
    expect(noValue.values?.propertyValue).toBeNull();
  });

  it('requires a valid balance, term, and rate', () => {
    expect(
      parseMortgageInput({ ...DEFAULT_MORTGAGE_INPUT, termYears: '0' }).errors
        .termYears,
    ).toBeTruthy();
    expect(
      parseMortgageInput({
        ...DEFAULT_MORTGAGE_INPUT,
        annualInterestRate: '101',
      }).errors.annualInterestRate,
    ).toBeTruthy();
    expect(
      parseMortgageInput({
        ...DEFAULT_MORTGAGE_INPUT,
        principal: '1,000,000,000,001',
      }).errors.principal,
    ).toBeTruthy();
  });

  it('requires a one-off month only when a lump sum is entered', () => {
    expect(
      parseMortgageInput({
        ...DEFAULT_MORTGAGE_INPUT,
        oneOffOverpayment: '1000',
        oneOffOverpaymentMonth: '',
      }).errors.oneOffOverpaymentMonth,
    ).toBeTruthy();
    expect(
      parseMortgageInput({
        ...DEFAULT_MORTGAGE_INPUT,
        oneOffOverpayment: '1000',
        oneOffOverpaymentMonth: '12',
      }).values?.oneOffOverpaymentMonth,
    ).toBe(12);
    expect(
      parseMortgageInput({
        ...DEFAULT_MORTGAGE_INPUT,
        oneOffOverpayment: '1000',
        oneOffOverpaymentMonth: '301',
      }).errors.oneOffOverpaymentMonth,
    ).toBeTruthy();
  });
});
