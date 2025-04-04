import { GualletClientImpl } from "./../GualletClient";
import {
  CreateInstitutionRequest,
  InstitutionDto,
} from "./institutions.models";

const INSTITUTIONS_PATH = "institutions";

export class InstitutionsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<InstitutionDto[]> {
    return await this.client.get<InstitutionDto[]>({ path: INSTITUTIONS_PATH });
  }

  async get(accountId: string): Promise<InstitutionDto> {
    return await this.client.get<InstitutionDto>({
      path: `${INSTITUTIONS_PATH}/${accountId}`,
    });
  }

  async create(request: CreateInstitutionRequest): Promise<InstitutionDto> {
    return await this.client.post<InstitutionDto, CreateInstitutionRequest>({
      path: INSTITUTIONS_PATH,
      payload: request,
    });
  }

  async edit(
    institutionId: string,
    request: InstitutionDto
  ): Promise<InstitutionDto> {
    return await this.client.put<InstitutionDto, CreateInstitutionRequest>({
      path: `${INSTITUTIONS_PATH}/${institutionId}`,
      payload: request,
    });
  }
}
