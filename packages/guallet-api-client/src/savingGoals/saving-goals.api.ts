import { GualletClientImpl } from "./../GualletClient";
import {
  CreateSavingGoalRequest,
  SavingGoalDto,
  UpdateSavingGoalRequest,
} from "./saving-goals.models";

const SAVING_GOALS_PATH = "saving-goals";

export class SavingGoalsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<SavingGoalDto[]> {
    return await this.client.get<SavingGoalDto[]>({ path: SAVING_GOALS_PATH });
  }

  async get(savingGoalId: string): Promise<SavingGoalDto> {
    return await this.client.get<SavingGoalDto>({
      path: `${SAVING_GOALS_PATH}/${savingGoalId}`,
    });
  }

  async create(request: CreateSavingGoalRequest): Promise<SavingGoalDto> {
    return await this.client.post<SavingGoalDto, CreateSavingGoalRequest>({
      path: SAVING_GOALS_PATH,
      payload: request,
    });
  }

  async update(
    savingGoalId: string,
    request: UpdateSavingGoalRequest
  ): Promise<SavingGoalDto> {
    return await this.client.patch<SavingGoalDto, UpdateSavingGoalRequest>({
      path: `${SAVING_GOALS_PATH}/${savingGoalId}`,
      payload: request,
    });
  }

  async delete(savingGoalId: string): Promise<SavingGoalDto> {
    return await this.client.fetch_delete<SavingGoalDto>({
      path: `${SAVING_GOALS_PATH}/${savingGoalId}`,
    });
  }
}
