import { GualletClient } from "GualletClient";
import {
  GualletInstitutionDto,
  InstitutionDto,
  ObConnection,
  ObConnectionRequest,
  ObRConnectionPermissionDto,
  OpenBankingCountryDto,
} from "./connections.models";

// const OPENBANKING_PATH = "openbanking";

export class ConnectionsApi {
  constructor(private client: GualletClient) {}

  async getSupportedCountries(): Promise<OpenBankingCountryDto[]> {
    return await this.client.get<OpenBankingCountryDto[]>(
      "openbanking/countries"
    );
  }

  async getInstitutionsForCountry(
    countryCode: string
  ): Promise<InstitutionDto[]> {
    return await this.client.get<InstitutionDto[]>(
      `openbanking/${countryCode}/institutions`
    );
  }

  async getInstitution(institutionId: string): Promise<InstitutionDto> {
    return await this.client.get<InstitutionDto>(
      `openbanking/institutions/${institutionId}/`
    );
  }

  async getAll(): Promise<ObConnection[]> {
    return await this.client.get<ObConnection[]>("openbanking/connections");
  }

  async get(id: string): Promise<ObConnection> {
    return await this.client.get<ObConnection>(`openbanking/connections/${id}`);
  }

  async getInstitutionDetails(id: string): Promise<GualletInstitutionDto> {
    return await this.client.get<GualletInstitutionDto>(
      `openbanking/institutions/${id}/`
    );
  }

  async createOpenBankingConnection(args: {
    institutionId: string;
    redirectTo: string;
  }): Promise<ObRConnectionPermissionDto> {
    return await this.client.post<
      ObRConnectionPermissionDto,
      ObConnectionRequest
    >("openbanking/connections", {
      institution_id: args.institutionId,
      // redirect_to: `${window.location.origin}/connections/connect/callback`,
      redirect_to: args.redirectTo,
    });
  }
}
