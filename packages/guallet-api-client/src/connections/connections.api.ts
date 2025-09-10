import { GualletClientImpl } from "./../GualletClient";
import {
  ConnectObAccountsRequest,
  GualletInstitutionDto,
  ObAccountDto,
  ObConnection,
  ObConnectionRequest,
  ObInstitutionDto,
  ObRConnectionPermissionDto,
  OpenBankingCountryDto,
} from "./connections.models";

const OPEN_BANKING_PATH = "openbanking";

export class ConnectionsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getSupportedCountries(): Promise<OpenBankingCountryDto[]> {
    return await this.client.get<OpenBankingCountryDto[]>({
      path: `${OPEN_BANKING_PATH}/countries`,
    });
  }

  async getInstitutionsForCountry(
    countryCode: string
  ): Promise<ObInstitutionDto[]> {
    return await this.client.get<ObInstitutionDto[]>({
      path: `${OPEN_BANKING_PATH}/${countryCode}/institutions`,
    });
  }

  async getInstitution(institutionId: string): Promise<ObInstitutionDto> {
    return await this.client.get<ObInstitutionDto>({
      path: `${OPEN_BANKING_PATH}/institutions/${institutionId}/`,
    });
  }

  async getAll(): Promise<ObConnection[]> {
    return await this.client.get<ObConnection[]>({
      path: `${OPEN_BANKING_PATH}/connections`,
    });
  }

  async get(id: string): Promise<ObConnection> {
    return await this.client.get<ObConnection>({
      path: `${OPEN_BANKING_PATH}/connections/${id}`,
    });
  }

  async getInstitutionDetails(id: string): Promise<GualletInstitutionDto> {
    return await this.client.get<GualletInstitutionDto>({
      path: `${OPEN_BANKING_PATH}/institutions/${id}/`,
    });
  }

  async createOpenBankingConnection({
    institution_id,
    redirect_to,
  }: ObConnectionRequest): Promise<ObRConnectionPermissionDto> {
    return await this.client.post<
      ObRConnectionPermissionDto,
      ObConnectionRequest
    >({
      path: `${OPEN_BANKING_PATH}/connections`,
      payload: {
        institution_id: institution_id,
        redirect_to: redirect_to,
      },
    });
  }

  async linkObAccounts(accountIds: string[]): Promise<ObAccountDto[]> {
    return await this.client.post<ObAccountDto[], ConnectObAccountsRequest>({
      path: `${OPEN_BANKING_PATH}/connections/connect`,
      payload: {
        account_ids: accountIds,
      },
    });
  }

  async getConnectionAccounts({
    connectionId,
  }: {
    connectionId: string;
  }): Promise<ObAccountDto[]> {
    return await this.client.get<ObAccountDto[]>({
      path: `${OPEN_BANKING_PATH}/connections/${connectionId}/accounts`,
    });
  }

  async deleteConnection(connectionId: string): Promise<void> {
    return await this.client.fetch_delete<void>({
      path: `${OPEN_BANKING_PATH}/connections/${connectionId}`,
    });
  }
}
