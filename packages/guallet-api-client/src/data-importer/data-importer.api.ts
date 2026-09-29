import { GualletClientImpl } from '../GualletClient';
import { DataImportRequest, DataImportResponse } from './data-importer.models';

const DATA_IMPORT_PATH = 'data';

export class DataImporterApi {
  constructor(private readonly client: GualletClientImpl) {}

  async importData(request: DataImportRequest): Promise<DataImportResponse> {
    return await this.client.post<DataImportResponse, DataImportRequest>({
      path: `${DATA_IMPORT_PATH}/import`,
      payload: request,
    });
  }
}
