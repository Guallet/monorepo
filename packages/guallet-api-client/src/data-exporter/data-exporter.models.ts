export interface DataExportRequest {
  startDate?: string;
  endDate?: string;
  accounts?: string[];
  format?: 'csv' | 'ofe' | 'json';
}

export interface DataExportResponse {
  message: string;
}
