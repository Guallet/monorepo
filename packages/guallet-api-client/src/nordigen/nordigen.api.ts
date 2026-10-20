import { GualletClientImpl } from '../GualletClient';
import {
  NordigenCredentialStatusDto,
  SaveNordigenCredentialsRequest,
} from './nordigen.models';

const PATH = 'nordigen/credentials';

export class NordigenApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getCredentialStatus(): Promise<NordigenCredentialStatusDto> {
    return await this.client.get({ path: PATH });
  }

  async saveCredentials(
    request: SaveNordigenCredentialsRequest,
  ): Promise<NordigenCredentialStatusDto> {
    return await this.client.post({ path: PATH, payload: request });
  }

  async deleteCredentials(): Promise<NordigenCredentialStatusDto> {
    return await this.client.fetch_delete({ path: PATH });
  }
}
