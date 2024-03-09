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
