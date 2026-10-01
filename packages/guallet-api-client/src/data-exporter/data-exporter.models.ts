export interface DataExportRequest {
  startDate?: string;
  endDate?: string;
  preserveDateTime?: boolean;
  accounts?: string[];
  format?: 'csv' | 'ofe' | 'json';
}

export interface DataExportResponse {
  message: string;
}
