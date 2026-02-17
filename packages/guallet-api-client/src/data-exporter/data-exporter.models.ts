export interface CsvExportRequest {
  startDate?: string;
  endDate?: string;
  accounts?: string[];
  format?: 'csv' | 'ofe' | 'json';
}

export interface CsvExportResponse {
  message: string;
}

export interface OfeExportRequest {
  startDate?: string;
  endDate?: string;
  accounts?: string[];
}

export interface OfeExportResponse {
  message: string;
}
