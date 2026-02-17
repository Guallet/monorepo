import { GualletClientImpl } from '../GualletClient';
import {
  CsvExportRequest,
  CsvExportResponse,
  OfeExportRequest,
  OfeExportResponse,
} from './data-exporter.models';

const DATA_EXPORTER_PATH = 'data-exporter';

export class DataExporterApi {
  constructor(private readonly client: GualletClientImpl) {}

  async exportCsv(request: CsvExportRequest): Promise<CsvExportResponse> {
    return await this.client.post<CsvExportResponse, CsvExportRequest>({
      path: `${DATA_EXPORTER_PATH}/csv`,
      payload: request,
    });
  }

  async exportOfe(request: OfeExportRequest): Promise<OfeExportResponse> {
    return await this.client.post<OfeExportResponse, CsvExportRequest>({
      path: `${DATA_EXPORTER_PATH}/csv`,
      payload: { ...request, format: 'ofe' },
    });
  }
}
