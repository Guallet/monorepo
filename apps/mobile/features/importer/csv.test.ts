import { describe, expect, it } from 'vitest';
import {
  accountKeys,
  buildImportRequest,
  parseCsv,
  rowErrors,
  validateFields,
} from './csv';

const CONTENT =
  'Date,Amount,Description,Account,Category\n2026-09-21,-4.80,Coffee,Everyday,Food\nwrong,2.00,Train,Everyday,Travel\n';

function mappedDraft() {
  const draft = parseCsv(CONTENT, 'transactions.csv');
  draft.fields = {
    date: 'Date',
    amount: 'Amount',
    description: 'Description',
    account: 'Account',
    category: 'Category',
    notes: '',
  };
  draft.accounts = {
    Everyday: { id: 'account-1', name: 'Everyday', shouldCreate: false },
  };
  draft.categories = {
    Food: null,
    Travel: { id: 'category-1', name: 'Travel', shouldCreate: false },
  };
  return draft;
}

describe('CSV import mapping', () => {
  it('requires all essential fields and rejects reused columns', () => {
    const draft = mappedDraft();
    draft.fields.amount = '';
    expect(validateFields(draft)).toContain('Map date, amount and description');
    draft.fields.amount = 'Date';
    expect(validateFields(draft)).toContain('only be mapped once');
  });

  it('requires a destination account when the CSV has no account column', () => {
    const draft = mappedDraft();
    draft.fields.account = '';
    draft.accounts = {};
    expect(accountKeys(draft)).toEqual(['default']);
    expect(() => buildImportRequest(draft)).toThrow(
      'Map account “default” first.',
    );
  });

  it('submits only valid rows and preserves category choices', () => {
    const draft = mappedDraft();
    expect(rowErrors(draft, draft.rows[1])).toContain('Invalid date');
    const request = buildImportRequest(draft);
    expect(request.csvData).toHaveLength(1);
    expect(request.accountMappings?.Everyday.id).toBe('account-1');
    expect(request.categoryMappings).toEqual({
      Travel: { id: 'category-1', name: 'Travel', shouldCreate: false },
    });
  });
});
