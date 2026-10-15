export type ImportFormat = 'csv' | 'ofe' | 'json';

export interface DataImportRequest {
  format: ImportFormat;

  // CSV-specific
  csvData?: CsvRowData[];
  fieldMappings?: FieldMappings;
  accountMappings?: Record<string, AccountMapping>;
  categoryMappings?: Record<string, CategoryMapping>;

  // OFE-specific
  ofeContent?: string;

  // JSON-specific
  jsonContent?: string;
}

export interface DataImportResponse {
  jobId: string;
  message: string;
  processedCount: number;
  failedCount: number;
}

export interface DataImportStatus {
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  processedCount: number;
  failedCount: number;
  error?: string;
}

// Keep these supporting interfaces for CSV import
export interface CsvRowData {
  [key: string]: string | number | boolean | null | undefined;
}

export interface FieldMappings {
  account: string;
  date: string;
  amount: string;
  description: string;
  notes: string;
  category: string;
}

export interface AccountMapping {
  id?: string;
  name: string;
  shouldCreate: boolean;
}

export interface CategoryMapping {
  id?: string;
  name: string;
  shouldCreate: boolean;
}
