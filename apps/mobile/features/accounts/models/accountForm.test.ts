import { AccountTypeDto } from '@guallet/api-client';
import { describe, expect, it } from 'vitest';
import { accountFormSchema } from './accountForm';

const account = {
  name: 'Travel wallet',
  type: AccountTypeDto.CURRENT_ACCOUNT,
  currency: 'USD',
  balance: '12.34',
  institutionId: null,
};

describe('account form validation', () => {
  it('accepts valid account details and locale decimal separators', () => {
    expect(accountFormSchema.safeParse(account).success).toBe(true);
    expect(
      accountFormSchema.safeParse({ ...account, balance: '-12,34' }).success,
    ).toBe(true);
  });

  it('validates balance precision using the selected currency', () => {
    expect(
      accountFormSchema.safeParse({
        ...account,
        currency: 'JPY',
        balance: '12.1',
      }).success,
    ).toBe(false);
    expect(
      accountFormSchema.safeParse({
        ...account,
        currency: 'BHD',
        balance: '12.345',
      }).success,
    ).toBe(true);
    expect(
      accountFormSchema.safeParse({ ...account, balance: '12.345' }).success,
    ).toBe(false);
  });

  it('rejects invalid names, currencies, and non-finite balances', () => {
    expect(
      accountFormSchema.safeParse({ ...account, name: '  ' }).success,
    ).toBe(false);
    expect(
      accountFormSchema.safeParse({ ...account, currency: 'ZZZ' }).success,
    ).toBe(false);
    expect(
      accountFormSchema.safeParse({ ...account, balance: '999'.repeat(200) })
        .success,
    ).toBe(false);
  });
});
