import { get, patch } from "../../../core/api/fetchHelper";

export async function loadTransactions(
  page: number,
  pageSize: number
): Promise<TransactionQueryResultDto> {
  const queryPath = `transactions?page=${page}&pageSize=${pageSize}`;
  return await get<TransactionQueryResultDto>(queryPath);
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
