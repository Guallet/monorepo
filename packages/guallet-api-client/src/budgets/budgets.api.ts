import { TransactionDto } from "transactions";
import { GualletClientImpl } from "./../GualletClient";
import {
  BudgetDto,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "./budgets.models";

const BUDGETS_PATH = "budgets";

export class BudgetsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<BudgetDto[]> {
    return await this.client.get<BudgetDto[]>({ path: BUDGETS_PATH });
  }

  async getById({
    budgetId,
    params,
  }: {
    budgetId: string;
    params?: { month?: number; year?: number };
  }): Promise<BudgetDto> {
    const queryParams = new URLSearchParams();
    if (params?.month !== undefined) {
      queryParams.append("month", params.month.toString());
    }
    if (params?.year !== undefined) {
      queryParams.append("year", params.year.toString());
    }

    return await this.client.get<BudgetDto>({
      path: `${BUDGETS_PATH}/${budgetId}?${queryParams}`,
    });
  }

  async create({
    request,
  }: {
    request: CreateBudgetRequest;
  }): Promise<BudgetDto> {
    return await this.client.post<BudgetDto, CreateBudgetRequest>({
      path: BUDGETS_PATH,
      payload: request,
    });
  }

  async update({
    budgetId,
    budget,
  }: {
    budgetId: string;
    budget: UpdateBudgetRequest;
  }): Promise<BudgetDto> {
    return await this.client.patch<BudgetDto, UpdateBudgetRequest>({
      path: `${BUDGETS_PATH}/${budgetId}`,
      payload: budget,
    });
  }

  async delete({ budgetId }: { budgetId: string }): Promise<BudgetDto> {
    return await this.client.fetch_delete<BudgetDto>({
      path: `${BUDGETS_PATH}/${budgetId}`,
    });
  }

  async getBudgetTransactions({
    budgetId,
    params,
  }: {
    budgetId: string;
    params?: {
      month?: number;
      year?: number;
    };
  }): Promise<TransactionDto[]> {
    const queryParams = new URLSearchParams();
    if (params?.month !== undefined) {
      queryParams.append("month", params.month.toString());
    }
    if (params?.year !== undefined) {
      queryParams.append("year", params.year.toString());
    }

    return await this.client.get<TransactionDto[]>({
      path: `${BUDGETS_PATH}/${budgetId}/transactions?${queryParams}`,
    });
  }
}
