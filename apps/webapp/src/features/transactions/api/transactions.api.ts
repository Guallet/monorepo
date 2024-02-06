import { get, patch } from "../../../core/api/fetchHelper";

export async function loadTransactions(args: {
  page: number;
  pageSize: number;
  accounts: string[] | null;
  categories: string[] | null;
  startDate: Date | null;
  endDate: Date | null;
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
  return await get<TransactionQueryResultDto>(queryPath);
}

export async function getTransactionsInbox(): Promise<TransactionDto[]> {
  const queryPath = "transactions/inbox";
  return await get<TransactionDto[]>(queryPath);
}

export async function updateTransactionCategory(args: {
  transactionId: string;
  categoryId: string;
}): Promise<TransactionDto> {
  const queryPath = `transactions/${args.transactionId}`;
  return await patch<TransactionDto, { categoryId: string }>(queryPath, {
    categoryId: args.categoryId,
  });
}

export async function updateTransactionNotes(args: {
  transactionId: string;
  notes: string;
}): Promise<TransactionDto> {
  const queryPath = `transactions/${args.transactionId}`;
  return await patch<TransactionDto, { notes: string }>(queryPath, {
    notes: args.notes,
  });
}

export type TransactionDto = {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  notes: string | null;
  categoryId: string | null;
};

export type TransactionQueryResultDto = {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  transactions: TransactionDto[];
};

export type UpdateTransactionRequest = {
  description: string | null;
  notes: string | null;
  amount: number | null;
  currency: string | null;
  date: Date | null;
  categoryId: string | null;
};
