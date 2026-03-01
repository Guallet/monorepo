import { GualletClientImpl } from '../GualletClient';
import { DataExportRequest, DataExportResponse } from './data-exporter.models';

const DATA_EXPORT_PATH = 'data';

export class DataExporterApi {
  constructor(private readonly client: GualletClientImpl) {}

  async exportData(request: DataExportRequest): Promise<DataExportResponse> {
    return await this.client.post<DataExportResponse, DataExportRequest>({
      path: `${DATA_EXPORT_PATH}/export`,
      payload: request,
    });
  }
}
