import Papa from 'papaparse';
import type {
  AccountMapping,
  CategoryMapping,
  CsvRowData,
  DataImportRequest,
  FieldMappings,
} from '@guallet/api-client';

export const EMPTY_FIELDS: FieldMappings = {
  account: '',
  date: '',
  amount: '',
  description: '',
  notes: '',
  category: '',
};

export interface CsvDraft {
  fileName: string;
  rows: CsvRowData[];
  columns: string[];
  fields: FieldMappings;
  accounts: Record<string, AccountMapping>;
  categories: Record<string, CategoryMapping | null>;
}

export function parseCsv(content: string, fileName: string): CsvDraft {
  const parsed = Papa.parse<CsvRowData>(content.replace(/^\uFEFF/, ''), {
    header: true,
    skipEmptyLines: 'greedy',
  });
  if (parsed.errors.length > 0) {
    throw new Error(`CSV parsing error: ${parsed.errors[0].message}`);
  }
  const columns = parsed.meta.fields ?? [];
  if (columns.length === 0 || parsed.data.length === 0) {
    throw new Error('This CSV has no headers or transaction rows.');
  }
  if (new Set(columns).size !== columns.length) {
    throw new Error('CSV column names must be unique.');
  }
  return {
    fileName,
    rows: parsed.data,
    columns,
    fields: { ...EMPTY_FIELDS },
    accounts: {},
    categories: {},
  };
}

export function validateFields(draft: CsvDraft): string | null {
  const { fields, columns } = draft;
  if (!fields.date || !fields.amount || !fields.description) {
    return 'Map date, amount and description before continuing.';
  }
  const chosen = Object.values(fields).filter(Boolean);
  if (new Set(chosen).size !== chosen.length) {
    return 'Each CSV column can only be mapped once.';
  }
  if (chosen.some((column) => !columns.includes(column))) {
    return 'A mapped column is missing from the CSV.';
  }
  return null;
}

export function distinctValues(draft: CsvDraft, field: 'account' | 'category') {
  const column = draft.fields[field];
  if (!column) return [];
  return [
    ...new Set(draft.rows.map((row) => String(row[column] ?? '').trim())),
  ].filter(Boolean);
}

export function accountKeys(draft: CsvDraft) {
  const values = distinctValues(draft, 'account');
  if (
    !draft.fields.account ||
    draft.rows.some((row) => !String(row[draft.fields.account] ?? '').trim())
  ) {
    values.push('default');
  }
  return [...new Set(values)];
}

function validDate(raw: string): boolean {
  const value = raw.trim();
  const match =
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})?)?$/.exec(
      value,
    );
  const local = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(value);
  if (!match && !local) return false;
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return (
      date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day)
    );
  }
  const [, first, second, year] = local!;
  const day =
    Number(first) > 12
      ? Number(first)
      : Number(second) > 12
        ? Number(second)
        : Number(first);
  const month =
    Number(first) > 12
      ? Number(second)
      : Number(second) > 12
        ? Number(first)
        : Number(second);
  const date = new Date(Number(year), month - 1, day);
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function rowErrors(draft: CsvDraft, row: CsvRowData): string[] {
  const fields = draft.fields;
  const errors: string[] = [];
  if (!validDate(String(row[fields.date] ?? ''))) errors.push('Invalid date');
  const amount = String(row[fields.amount] ?? '').trim();
  if (!amount || !Number.isFinite(Number(amount.replace(',', '.')))) {
    errors.push('Invalid amount');
  }
  if (!String(row[fields.description] ?? '').trim()) {
    errors.push('Missing description');
  }
  const account = String(row[fields.account] ?? '').trim() || 'default';
  if (!draft.accounts[account]) errors.push('Account not mapped');
  return errors;
}

export function buildImportRequest(draft: CsvDraft): DataImportRequest {
  const fieldError = validateFields(draft);
  if (fieldError) throw new Error(fieldError);
  for (const key of accountKeys(draft)) {
    if (!draft.accounts[key]) throw new Error(`Map account “${key}” first.`);
  }
  const rows = draft.rows.filter((row) => rowErrors(draft, row).length === 0);
  if (rows.length === 0) throw new Error('No valid rows to import.');
  const categoryMappings: Record<string, CategoryMapping> = {};
  for (const [key, mapping] of Object.entries(draft.categories)) {
    if (mapping) categoryMappings[key] = mapping;
  }
  return {
    format: 'csv',
    csvData: rows,
    fieldMappings: draft.fields,
    accountMappings: draft.accounts,
    categoryMappings,
  };
}
