import { describe, expect, it } from 'vitest';
import {
  accountInputLabel,
  groupAccounts,
  type AccountPickerItem,
} from './accountInputUtils';

const accounts: AccountPickerItem[] = [
  { id: 'save', name: 'Holiday savings', type: 'savings-account' },
  { id: 'daily', name: 'Everyday account', type: 'current-account' },
  { id: 'joint', name: 'Joint account', type: 'current-account' },
  { id: 'card', name: 'Travel card', type: 'credit-card' },
];

describe('groupAccounts', () => {
  it('keeps type order and input order within each group', () => {
    expect(
      groupAccounts(accounts, '').map(({ title, items }) => [
        title,
        items.map(({ id }) => id),
      ]),
    ).toEqual([
      ['Current accounts', ['daily', 'joint']],
      ['Savings accounts', ['save']],
      ['Credit cards', ['card']],
    ]);
  });

  it('filters names ignoring case and drops empty groups', () => {
    expect(
      groupAccounts(accounts, '  ACCOUNT ').map(({ type, items }) => [
        type,
        items.map(({ id }) => id),
      ]),
    ).toEqual([['current-account', ['daily', 'joint']]]);
    expect(groupAccounts(accounts, 'no match')).toEqual([]);
  });
});

describe('accountInputLabel', () => {
  it('shows the selected name or placeholder in single mode', () => {
    expect(accountInputLabel(accounts, 'daily', 'single', 'Choose')).toBe(
      'Everyday account',
    );
    expect(accountInputLabel(accounts, null, 'single', 'Choose')).toBe(
      'Choose',
    );
  });

  it('shows the name for one account and a count for several', () => {
    expect(accountInputLabel(accounts, ['save'], 'multiple', 'Choose')).toBe(
      'Holiday savings',
    );
    expect(
      accountInputLabel(accounts, ['save', 'daily'], 'multiple', 'Choose'),
    ).toBe('2 accounts selected');
  });
});
