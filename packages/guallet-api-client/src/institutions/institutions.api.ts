import { GualletClientImpl } from './../GualletClient';
import {
  CreateInstitutionRequest,
  InstitutionDto,
  UpdateInstitutionRequest,
} from './institutions.models';

const INSTITUTIONS_PATH = 'institutions';

export class InstitutionsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<InstitutionDto[]> {
    return await this.client.get<InstitutionDto[]>({ path: INSTITUTIONS_PATH });
  }

  async get(institutionId: string): Promise<InstitutionDto> {
    return await this.client.get<InstitutionDto>({
      path: `${INSTITUTIONS_PATH}/${institutionId}`,
    });
  }

  async create(request: CreateInstitutionRequest): Promise<InstitutionDto> {
    return await this.client.post<InstitutionDto, CreateInstitutionRequest>({
      path: INSTITUTIONS_PATH,
      payload: request,
    });
  }

  async update(
    institutionId: string,
    request: UpdateInstitutionRequest,
  ): Promise<InstitutionDto> {
    return await this.client.patch<InstitutionDto, UpdateInstitutionRequest>({
      path: `${INSTITUTIONS_PATH}/${institutionId}`,
      payload: request,
    });
  }

  /** Retained for callers using the original edit method. */
  async edit(institutionId: string, request: UpdateInstitutionRequest) {
    return await this.update(institutionId, request);
  }

  async delete(institutionId: string): Promise<void> {
    await this.client.fetch_delete<InstitutionDto>({
      path: `${INSTITUTIONS_PATH}/${institutionId}`,
    });
  }
}
