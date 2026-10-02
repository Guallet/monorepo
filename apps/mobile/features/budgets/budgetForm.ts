import type { CreateBudgetRequest } from '@guallet/api-client';
import { Currency } from '@guallet/money';

export type BudgetFormValues = {
  name: string;
  currency: string;
  amount: string;
  colour: string;
  icon: string;
  categoryIds: string[];
};

export type BudgetFormErrors = Partial<
  Record<
    'name' | 'currency' | 'amount' | 'colour' | 'icon' | 'categories',
    string
  >
>;

export function validateBudgetForm(
  values: BudgetFormValues,
  accountCurrencies: string[],
): { errors: BudgetFormErrors; request: CreateBudgetRequest | null } {
  const errors: BudgetFormErrors = {};
  const name = values.name.trim();
  const currency = values.currency.trim().toUpperCase();
  const amountText = values.amount.trim().replace(',', '.');
  const amount = Number(amountText);
  const allowedCurrencies = new Set(
    accountCurrencies.map((code) => code.toUpperCase()),
  );

  if (name.length < 2) {
    errors.name = 'Enter a name with at least two characters.';
  }

  let decimalPlaces = 0;
  if (!allowedCurrencies.has(currency)) {
    errors.currency = 'Choose a currency used by one of your accounts.';
  } else {
    try {
      decimalPlaces = Currency.fromISOCode(currency).decimalPlaces;
    } catch {
      errors.currency = 'Choose a supported currency.';
    }
  }

  const decimalLength = amountText.split('.')[1]?.length ?? 0;
  if (
    !/^\d+(?:\.\d+)?$/.test(amountText) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    errors.amount = 'Enter an amount above zero.';
  } else if (!errors.currency && decimalLength > decimalPlaces) {
    errors.amount = `Use no more than ${decimalPlaces} decimal places for ${currency}.`;
  }

  if (!values.colour) errors.colour = 'Select a colour.';
  if (!values.icon) errors.icon = 'Select an icon.';
  if (values.categoryIds.length === 0) {
    errors.categories = 'Select at least one category.';
  }

  if (Object.keys(errors).length > 0) return { errors, request: null };

  return {
    errors,
    request: {
      name,
      currency,
      amount,
      colour: values.colour,
      icon: values.icon,
      categories: values.categoryIds,
    },
  };
}
