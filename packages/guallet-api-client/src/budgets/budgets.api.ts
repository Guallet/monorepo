import { GualletClient } from "./../GualletClient";
import { BudgetDto } from "./budgets.models";

const BUDGETS_PATH = "budgets";

export class BudgetsApi {
  constructor(private client: GualletClient) {}

  async getAll(): Promise<BudgetDto[]> {
    return await this.client.get<BudgetDto[]>(BUDGETS_PATH);
  }
}
