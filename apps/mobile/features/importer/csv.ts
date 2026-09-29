import Papa from 'papaparse';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type {
  AccountMapping,
  CategoryMapping,
  CsvRowData,
  DataImportRequest,
  FieldMappings,
} from '@guallet/api-client';

dayjs.extend(customParseFormat);

// Keep this list aligned with the API importer's date parser.
const SUPPORTED_DATE_FORMATS = [
  'YYYY-MM-DD',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DDTHH:mm:ssZ',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'DD-MM-YYYY',
  'YYYY/MM/DD',
  'DD.MM.YYYY',
];

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
    accounts: Object.create(null),
    categories: Object.create(null),
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
  if (fields.account) {
    const values = new Set(
      draft.rows.map((row) => String(row[fields.account] ?? '').trim()),
    );
    if (values.has('') && values.has('default')) {
      return 'The account column contains both blank values and “default”. Rename one of them in the CSV before importing.';
    }
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
  if (!value) return false;
  if (dayjs(value, SUPPORTED_DATE_FORMATS, true).isValid()) return true;
  const timestamp = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/.exec(value);
  if (!timestamp) return false;
  const suffix = value.slice(timestamp[0].length);
  if (!/^(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/.test(suffix)) {
    return false;
  }
  if (!dayjs(timestamp[1], 'YYYY-MM-DD', true).isValid()) return false;
  if (Number(timestamp[2]) > 23 || Number(timestamp[3]) > 59) return false;
  const seconds = /^:(\d{2})/.exec(suffix);
  if (seconds && Number(seconds[1]) > 59) return false;
  return dayjs(value).isValid();
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
  if (!Object.hasOwn(draft.accounts, account)) {
    errors.push('Account not mapped');
  }
  return errors;
}

export function buildImportRequest(draft: CsvDraft): DataImportRequest {
  const fieldError = validateFields(draft);
  if (fieldError) throw new Error(fieldError);
  for (const key of accountKeys(draft)) {
    if (!Object.hasOwn(draft.accounts, key)) {
      throw new Error(`Map account “${key}” first.`);
    }
  }
  const rows = draft.rows
    .filter((row) => rowErrors(draft, row).length === 0)
    .map((row) => {
      const normalized = { ...row };
      normalized[draft.fields.date] = String(
        row[draft.fields.date] ?? '',
      ).trim();
      if (draft.fields.account) {
        normalized[draft.fields.account] = String(
          row[draft.fields.account] ?? '',
        ).trim();
      }
      if (draft.fields.category) {
        normalized[draft.fields.category] = String(
          row[draft.fields.category] ?? '',
        ).trim();
      }
      return normalized;
    });
  if (rows.length === 0) throw new Error('No valid rows to import.');
  const usedAccounts = new Set(
    rows.map((row) => String(row[draft.fields.account] ?? '') || 'default'),
  );
  const accountMappings = Object.create(null) as Record<string, AccountMapping>;
  for (const key of usedAccounts) {
    accountMappings[key] = draft.accounts[key];
  }
  const usedCategories = new Set(
    rows.map((row) => String(row[draft.fields.category] ?? '')).filter(Boolean),
  );
  const categoryMappings = Object.create(null) as Record<
    string,
    CategoryMapping
  >;
  for (const [key, mapping] of Object.entries(draft.categories)) {
    if (mapping && usedCategories.has(key)) categoryMappings[key] = mapping;
  }
  return {
    format: 'csv',
    csvData: rows,
    fieldMappings: draft.fields,
    accountMappings,
    categoryMappings,
  };
}

const MAX_IMPORT_REQUEST_BYTES = 10 * 1024 * 1024;

export function validateImportRequestSize(request: DataImportRequest): void {
  const body = JSON.stringify(request);
  let bytes = 0;
  for (const character of body) {
    const codePoint = character.codePointAt(0)!;
    if (codePoint <= 0x7f) bytes++;
    else if (codePoint <= 0x7ff) bytes += 2;
    else if (codePoint <= 0xffff) bytes += 3;
    else bytes += 4;
    if (bytes > MAX_IMPORT_REQUEST_BYTES) {
      throw new Error(
        'This import is too large to submit. Split the CSV into smaller files.',
      );
    }
  }
}
