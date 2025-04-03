import { GualletClient } from "./../GualletClient";

const ADMIN_PATH = "admin";

export class AdminApi {
  constructor(private readonly client: GualletClient) {}

  async syncOpenBankingInstitutions(): Promise<Response> {
    return await this.client.getRawResponse(`${ADMIN_PATH}/sync/institutions`);
  }
}
