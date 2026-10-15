import { describe, expect, it } from 'vitest';
import {
  accountKeys,
  buildImportRequest,
  parseCsv,
  rowErrors,
  validateImportRequestSize,
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
    expect(request.categoryMappings).toEqual({});
  });

  it('uses the same trimmed account and category keys in preview and submission', () => {
    const draft = mappedDraft();
    draft.rows[0].Account = ' Everyday ';
    draft.rows[0].Category = ' Food ';
    expect(rowErrors(draft, draft.rows[0])).toEqual([]);
    const request = buildImportRequest(draft);
    expect(request.csvData?.[0].Account).toBe('Everyday');
    expect(request.csvData?.[0].Category).toBe('Food');
    expect(draft.rows[0].Account).toBe(' Everyday ');
  });

  it('accepts timestamp formats supported by the API importer', () => {
    const draft = mappedDraft();
    for (const date of [
      '2026-09-21T14:30:00.000Z',
      '2026-09-21 14:30:00',
      '21/09/2026',
    ]) {
      draft.rows[0].Date = date;
      expect(rowErrors(draft, draft.rows[0])).toEqual([]);
      expect(buildImportRequest(draft).csvData).toHaveLength(1);
    }
  });

  it('rejects calendar overflows and invalid timestamp hours', () => {
    const draft = mappedDraft();
    for (const date of [
      '2026-02-30',
      '2026-02-30T14:30:00Z',
      '2026-09-21 25:30:00',
    ]) {
      draft.rows[0].Date = date;
      expect(rowErrors(draft, draft.rows[0])).toContain('Invalid date');
    }
  });

  it('rejects blank accounts mixed with the literal default name', () => {
    const draft = mappedDraft();
    draft.rows[0].Account = '';
    draft.rows[1].Account = 'default';
    expect(validateFields(draft)).toContain('both blank values and “default”');
    expect(() => buildImportRequest(draft)).toThrow(
      'both blank values and “default”',
    );
  });

  it('does not treat inherited object keys as account mappings', () => {
    const draft = mappedDraft();
    draft.rows[0].Account = 'toString';
    expect(rowErrors(draft, draft.rows[0])).toContain('Account not mapped');
    expect(() => buildImportRequest(draft)).toThrow(
      'Map account “toString” first.',
    );
  });

  it('preserves an account named __proto__ in the request', () => {
    const draft = mappedDraft();
    draft.rows[0].Account = '__proto__';
    draft.accounts = {
      ...draft.accounts,
      ['__proto__']: {
        id: 'account-2',
        name: '__proto__',
        shouldCreate: false,
      },
    };
    const request = buildImportRequest(draft);
    expect(JSON.stringify(request.accountMappings)).toContain('"__proto__"');
  });

  it('submits the trimmed date that passed preview validation', () => {
    const draft = mappedDraft();
    draft.rows[0].Date = ' 21/09/2026 ';
    expect(rowErrors(draft, draft.rows[0])).toEqual([]);
    expect(buildImportRequest(draft).csvData?.[0].Date).toBe('21/09/2026');
    expect(draft.rows[0].Date).toBe(' 21/09/2026 ');
  });

  it('omits create mappings used only by skipped rows', () => {
    const draft = mappedDraft();
    draft.rows[1].Account = 'Unused account';
    draft.rows[1].Category = 'Unused category';
    draft.accounts['Unused account'] = {
      name: 'Unused account',
      shouldCreate: true,
    };
    draft.categories['Unused category'] = {
      name: 'Unused category',
      shouldCreate: true,
    };
    const request = buildImportRequest(draft);
    expect(request.accountMappings).toEqual({
      Everyday: draft.accounts.Everyday,
    });
    expect(request.categoryMappings).toEqual({});
  });

  it('rejects a serialized request larger than the API body limit', () => {
    const request = buildImportRequest(mappedDraft());
    expect(() => validateImportRequestSize(request)).not.toThrow();
    request.csvData![0].Description = 'a'.repeat(10 * 1024 * 1024);
    expect(() => validateImportRequestSize(request)).toThrow(
      'Split the CSV into smaller files.',
    );
  });

  it('counts Unicode code points in the serialized request size', () => {
    const request = buildImportRequest(mappedDraft());
    request.csvData![0].Description = '😀'.repeat(2_621_500);
    expect(() => validateImportRequestSize(request)).toThrow(
      'Split the CSV into smaller files.',
    );
  });
});
