import { describe, expect, it } from 'vitest';
import { validateBudgetForm, type BudgetFormValues } from './budgetForm';

const validValues: BudgetFormValues = {
  name: ' Groceries ',
  currency: 'GBP',
  amount: '400,50',
  colour: '#005EB8',
  icon: 'IconShoppingCart',
  categoryIds: ['category-one', 'category-two'],
};

describe('budget form validation', () => {
  it('builds a recurring budget request from the selected fields', () => {
    expect(validateBudgetForm(validValues, ['GBP']).request).toEqual({
      name: 'Groceries',
      currency: 'GBP',
      amount: 400.5,
      colour: '#005EB8',
      icon: 'IconShoppingCart',
      categories: ['category-one', 'category-two'],
    });
  });

  it('rejects missing fields and a currency outside the user accounts', () => {
    const result = validateBudgetForm(
      {
        name: 'G',
        currency: 'EUR',
        amount: '0',
        colour: '',
        icon: '',
        categoryIds: [],
      },
      ['GBP'],
    );
    expect(result.request).toBeNull();
    expect(Object.keys(result.errors)).toEqual([
      'name',
      'currency',
      'amount',
      'colour',
      'icon',
      'categories',
    ]);
  });

  it('respects each currency’s minor-unit precision', () => {
    expect(
      validateBudgetForm({ ...validValues, currency: 'JPY', amount: '400.5' }, [
        'JPY',
      ]).errors.amount,
    ).toBeDefined();
    expect(
      validateBudgetForm(
        { ...validValues, currency: 'BHD', amount: '400.125' },
        ['BHD'],
      ).request?.amount,
    ).toBe(400.125);
  });
});
