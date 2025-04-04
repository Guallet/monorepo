import { GualletClientImpl } from "./../GualletClient";
import {
  GualletInstitutionDto,
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

  async createOpenBankingConnection(args: {
    institutionId: string;
    redirectTo: string;
  }): Promise<ObRConnectionPermissionDto> {
    return await this.client.post<
      ObRConnectionPermissionDto,
      ObConnectionRequest
    >({
      path: `${OPEN_BANKING_PATH}/connections`,
      payload: {
        institution_id: args.institutionId,
        // redirect_to: `${window.location.origin}/connections/connect/callback`,
        redirect_to: args.redirectTo,
      },
    });
  }
}
