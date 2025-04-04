import { GualletClientImpl } from "./../GualletClient";

const ADMIN_PATH = "admin";

export class AdminApi {
  constructor(private readonly client: GualletClientImpl) {}

  async syncOpenBankingInstitutions(): Promise<Response> {
    return await this.client.getRawResponse({
      path: `${ADMIN_PATH}/sync/institutions`,
    });
  }
}
