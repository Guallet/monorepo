import { describe, expect, it } from 'vitest';
import { AccountTypeDto, type AccountDto } from '@guallet/api-client';
import {
  getMonthlyInOut,
  groupAccounts,
  isManualAccount,
  validateAccountForm,
} from './accountFlow';
import {
  getPropertyValues,
  getVisibleAccountProperties,
  parseAccountProperties,
} from './accountProperties';

const account = (
  id: string,
  name: string,
  type: AccountTypeDto,
  source: AccountDto['source'] = 'manual',
): AccountDto => ({
  id,
  name,
  type,
  source,
  currency: 'GBP',
  balance: { amount: 100, currency: 'GBP' },
  institutionId: '',
});

describe('mobile account flows', () => {
  it('groups the list in account type order and filters by name regardless of case', () => {
    const accounts = [
      account('2', 'Holiday Savings', AccountTypeDto.SAVINGS),
      account('1', 'Main Current', AccountTypeDto.CURRENT_ACCOUNT),
    ];
    expect(groupAccounts(accounts, '').map((group) => group.type)).toEqual([
      AccountTypeDto.CURRENT_ACCOUNT,
      AccountTypeDto.SAVINGS,
    ]);
    expect(
      groupAccounts(accounts, '  HOLIDAY  ')[0].accounts.map((item) => item.id),
    ).toEqual(['2']);
    expect(groupAccounts(accounts, 'missing')).toEqual([]);
  });

  it('validates create and update values before sending them', () => {
    expect(
      validateAccountForm({
        name: '  Daily  ',
        currency: ' gbp ',
        balance: '-20,50',
      }),
    ).toEqual({ values: { name: 'Daily', currency: 'GBP', balance: -20.5 } });
    expect(
      validateAccountForm({ name: '', currency: 'GBP', balance: '0' }),
    ).toHaveProperty('error');
    expect(
      validateAccountForm({ name: 'Daily', currency: 'GB', balance: '0' }),
    ).toHaveProperty('error');
    expect(
      validateAccountForm({ name: 'Daily', currency: 'GBP', balance: '' }),
    ).toHaveProperty('error');
    expect(
      validateAccountForm({ name: 'Daily', currency: 'JPY', balance: '1.5' }),
    ).toHaveProperty('error');
    expect(
      validateAccountForm({ name: 'Daily', currency: 'BHD', balance: '1.234' }),
    ).toEqual({ values: { name: 'Daily', currency: 'BHD', balance: 1.234 } });
  });

  it('encodes account type fields and rejects invalid details', () => {
    const values = getPropertyValues();
    values.interestRate = '2,5';
    expect(
      parseAccountProperties(AccountTypeDto.SAVINGS, values, 'GBP').properties,
    ).toEqual({ interestRate: 2.5 });
    values.interestRate = '-1';
    expect(
      parseAccountProperties(AccountTypeDto.SAVINGS, values, 'GBP').error,
    ).toBeDefined();
    values.interestRate = '2';
    expect(
      parseAccountProperties(AccountTypeDto.CREDIT_CARD, values, 'GBP').error,
    ).toBeDefined();
    values.interestRate = '';
    values.cycleDay = '32';
    expect(
      parseAccountProperties(AccountTypeDto.CREDIT_CARD, values, 'GBP').error,
    ).toBeDefined();
    const mortgageValues = getPropertyValues();
    mortgageValues.propertyValue = '100.001';
    mortgageValues.mortgageAmount = '80';
    mortgageValues.interestRate = '2';
    mortgageValues.termLength = '20';
    expect(
      parseAccountProperties(AccountTypeDto.MORTGAGE, mortgageValues, 'GBP')
        .error,
    ).toBeDefined();
  });

  it('shows details and chronological monthly activity on the detail screen', () => {
    const savings = {
      ...account('1', 'Savings', AccountTypeDto.SAVINGS),
      properties: { interestRate: 2.5 },
    };
    expect(getVisibleAccountProperties(savings)).toEqual([
      { label: 'Interest rate', value: '2.5%' },
    ]);
    const mortgage = {
      ...account('2', 'Home', AccountTypeDto.MORTGAGE),
      properties: {
        propertyValue: 1234.5,
        mortgageAmount: 1000,
        interestRate: 3,
        termLength: 20,
      },
    };
    expect(getVisibleAccountProperties(mortgage)).toContainEqual({
      label: 'Property value',
      value: '£1,234.50',
    });
    expect(
      getMonthlyInOut([
        { year: 2025, month: 11, total_in: 3, total_out: 2 },
        { year: 2026, month: 1, total_in: 4, total_out: 1 },
      ]).map((month) => month.month),
    ).toEqual([1, 11]);
  });

  it('offers edit and delete only for manually managed accounts', () => {
    expect(
      isManualAccount(account('1', 'Cash', AccountTypeDto.CURRENT_ACCOUNT)),
    ).toBe(true);
    expect(
      isManualAccount(
        account('2', 'Imported', AccountTypeDto.CURRENT_ACCOUNT, 'imported'),
      ),
    ).toBe(false);
    expect(
      isManualAccount(
        account('3', 'Bank', AccountTypeDto.CURRENT_ACCOUNT, 'synced'),
      ),
    ).toBe(false);
  });
});
