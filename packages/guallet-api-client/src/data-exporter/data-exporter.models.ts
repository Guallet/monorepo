export interface CsvExportRequest {
  startDate?: string;
  endDate?: string;
  accounts?: string[];
}

export interface CsvExportResponse {
  message: string;
}

export type OfeExportRequest = CsvExportRequest;
export type OfeExportResponse = CsvExportResponse;
