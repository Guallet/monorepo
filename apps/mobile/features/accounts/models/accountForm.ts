import { AccountTypeDto } from '@guallet/api-client';
import { Currency } from '@guallet/money';
import { z } from 'zod';

export const accountFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter an account name.'),
    type: z.nativeEnum(AccountTypeDto),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .refine((code) => {
        try {
          Currency.fromISOCode(code);
          return true;
        } catch {
          return false;
        }
      }, 'Select a valid currency.'),
    balance: z
      .string()
      .trim()
      .regex(/^-?(?:\d+|\d*[.,]\d+)$/, 'Enter a valid balance.'),
    institutionId: z.string().nullable(),
  })
  .superRefine((value, context) => {
    let currency: Currency;
    try {
      currency = Currency.fromISOCode(value.currency);
    } catch {
      return;
    }

    const normalizedBalance = value.balance.trim().replace(',', '.');
    if (!Number.isFinite(Number(normalizedBalance))) {
      context.addIssue({
        code: 'custom',
        path: ['balance'],
        message: 'Enter a valid balance.',
      });
      return;
    }

    const fraction = normalizedBalance.split('.')[1] ?? '';
    if (fraction.length > currency.decimalPlaces) {
      context.addIssue({
        code: 'custom',
        path: ['balance'],
        message: `${value.currency} supports up to ${currency.decimalPlaces} decimal places.`,
      });
    }
  });
