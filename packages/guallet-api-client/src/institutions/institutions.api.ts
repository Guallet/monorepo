import { GualletClient } from "./../GualletClient";
import { InstitutionDto } from "./institutions.models";

const INSTITUTIONS_PATH = "institutions";

export class InstitutionsApi {
  constructor(private client: GualletClient) {}

  async getAll(): Promise<InstitutionDto[]> {
    return await this.client.get<InstitutionDto[]>(INSTITUTIONS_PATH);
  }

  async get(accountId: string): Promise<InstitutionDto> {
    return await this.client.get<InstitutionDto>(
      `${INSTITUTIONS_PATH}/${accountId}`
    );
  }
}
