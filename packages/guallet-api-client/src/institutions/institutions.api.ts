import { GualletClient } from "./../GualletClient";
import {
  CreateInstitutionRequest,
  InstitutionDto,
} from "./institutions.models";

const INSTITUTIONS_PATH = "institutions";

export class InstitutionsApi {
  constructor(private readonly client: GualletClient) {}

  async getAll(): Promise<InstitutionDto[]> {
    return await this.client.get<InstitutionDto[]>(INSTITUTIONS_PATH);
  }

  async get(accountId: string): Promise<InstitutionDto> {
    return await this.client.get<InstitutionDto>(
      `${INSTITUTIONS_PATH}/${accountId}`
    );
  }

  async create(request: CreateInstitutionRequest): Promise<InstitutionDto> {
    return await this.client.post<InstitutionDto, CreateInstitutionRequest>(
      INSTITUTIONS_PATH,
      request
    );
  }

  async edit(
    institutionId: string,
    request: InstitutionDto
  ): Promise<InstitutionDto> {
    return await this.client.put<InstitutionDto, CreateInstitutionRequest>(
      `${INSTITUTIONS_PATH}/${institutionId}`,
      request
    );
  }
}
