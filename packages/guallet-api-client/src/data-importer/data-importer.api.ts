import { GualletClientImpl } from '../GualletClient';
import { CsvImportRequest, CsvImportResponse } from './data-importer.models';

const DATA_IMPORTER_PATH = 'data-importer';

export class DataImporterApi {
  constructor(private readonly client: GualletClientImpl) {}

  async importCsv(request: CsvImportRequest): Promise<CsvImportResponse> {
    return await this.client.post<CsvImportResponse, CsvImportRequest>({
      path: `${DATA_IMPORTER_PATH}/csv`,
      payload: request,
    });
  }
}
