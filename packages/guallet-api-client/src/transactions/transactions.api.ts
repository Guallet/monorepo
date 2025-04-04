import { GualletClientImpl } from "./../GualletClient";
import {
  InboxTransactionDto,
  TransactionDto,
  TransactionQueryResultDto,
} from "./transactions.models";

const TRANSACTIONS_PATH = "transactions";

export class TransactionsApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<TransactionQueryResultDto> {
    return await this.client.get<TransactionQueryResultDto>({
      path: TRANSACTIONS_PATH,
    });
  }

  async loadTransactions(args: {
    page: number;
    pageSize?: number | null;
    accounts?: string[] | null;
    categories?: string[] | null;
    startDate?: Date | null;
    endDate?: Date | null;
  }): Promise<TransactionQueryResultDto> {
    const { page, pageSize, accounts, categories, startDate, endDate } = args;
    let queryPath = `transactions?page=${page}&pageSize=${pageSize}`;
    if (accounts && accounts.length > 0) {
      queryPath = `${queryPath}&accounts=${accounts.join(",")}`;
    }
    if (categories && categories.length > 0) {
      queryPath = `${queryPath}&categories=${categories.join(",")}`;
    }
    if (startDate) {
      queryPath = `${queryPath}&startDate=${startDate.toISOString()}`;
    }
    if (endDate) {
      queryPath = `${queryPath}&endDate=${endDate.toISOString()}`;
    }
    return await this.client.get<TransactionQueryResultDto>({
      path: queryPath,
    });
  }

  async getInbox(): Promise<InboxTransactionDto[]> {
    return await this.client.get<InboxTransactionDto[]>({
      path: `${TRANSACTIONS_PATH}/inbox`,
    });
  }

  async get(id: string): Promise<TransactionDto> {
    return await this.client.get<TransactionDto>({
      path: `${TRANSACTIONS_PATH}/${id}`,
    });
  }

  async updateTransactionCategory(args: {
    transactionId: string;
    categoryId: string;
  }): Promise<TransactionDto> {
    const queryPath = `transactions/${args.transactionId}`;
    return await this.client.patch<TransactionDto, { categoryId: string }>({
      path: queryPath,
      payload: {
        categoryId: args.categoryId,
      },
    });
  }

  async updateTransactionNotes(args: {
    transactionId: string;
    notes: string;
  }): Promise<TransactionDto> {
    const queryPath = `transactions/${args.transactionId}`;
    return await this.client.patch<TransactionDto, { notes: string }>({
      path: queryPath,
      payload: {
        notes: args.notes,
      },
    });
  }
}
