export interface CsvExportRequest {
  startDate?: string;
  endDate?: string;
  accounts?: string[];
}

export interface CsvExportResponse {
  message: string;
}
