import { GualletClientImpl } from "./../GualletClient";
import { BudgetDto } from "./budgets.models";

const BUDGETS_PATH = "budgets";

export class BudgetsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<BudgetDto[]> {
    return await this.client.get<BudgetDto[]>({ path: BUDGETS_PATH });
  }

  async getById(budgetId: string): Promise<BudgetDto> {
    return await this.client.get<BudgetDto>({
      path: `${BUDGETS_PATH}/${budgetId}`,
    });
  }
}
