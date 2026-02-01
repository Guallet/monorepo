import { GualletClientImpl } from '../GualletClient';
import { CsvExportRequest, CsvExportResponse } from './data-exporter.models';

const DATA_EXPORTER_PATH = 'data-exporter';

export class DataExporterApi {
  constructor(private readonly client: GualletClientImpl) {}

  async exportCsv(request: CsvExportRequest): Promise<CsvExportResponse> {
    return await this.client.post<CsvExportResponse, CsvExportRequest>({
      path: `${DATA_EXPORTER_PATH}/csv`,
      payload: request,
    });
  }
}
