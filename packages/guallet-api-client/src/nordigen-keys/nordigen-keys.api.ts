import { GualletClientImpl } from "./../GualletClient";
import {
  NordigenKey,
  CreateNordigenKeyRequest,
  UpdateNordigenKeyRequest,
  LinkAccountsRequest,
} from "./nordigen-keys.models";

const NORDIGEN_KEYS_PATH = "nordigen-keys";

export class NordigenKeysApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<NordigenKey[]> {
    return await this.client.get<NordigenKey[]>({ path: NORDIGEN_KEYS_PATH });
  }

  async getById(id: string): Promise<NordigenKey> {
    return await this.client.get<NordigenKey>({
      path: `${NORDIGEN_KEYS_PATH}/${id}`,
    });
  }

  async create(request: CreateNordigenKeyRequest): Promise<NordigenKey> {
    return await this.client.post<NordigenKey, CreateNordigenKeyRequest>({
      path: NORDIGEN_KEYS_PATH,
      payload: request,
    });
  }

  async update(
    id: string,
    request: UpdateNordigenKeyRequest
  ): Promise<NordigenKey> {
    return await this.client.put<NordigenKey, UpdateNordigenKeyRequest>({
      path: `${NORDIGEN_KEYS_PATH}/${id}`,
      payload: request,
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.fetch_delete<void>({
      path: `${NORDIGEN_KEYS_PATH}/${id}`,
    });
  }

  async linkAccounts(
    id: string,
    request: LinkAccountsRequest
  ): Promise<NordigenKey> {
    return await this.client.post<NordigenKey, LinkAccountsRequest>({
      path: `${NORDIGEN_KEYS_PATH}/${id}/accounts`,
      payload: request,
    });
  }

  async unlinkAccounts(
    id: string,
    request: LinkAccountsRequest
  ): Promise<NordigenKey> {
    return await this.client.fetch_delete<NordigenKey>({
      path: `${NORDIGEN_KEYS_PATH}/${id}/accounts`,
      payload: request,
    });
  }
}
