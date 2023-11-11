export type Transaction = {
  id: string;
  name: string;
  icon: string;
  colour: string;
  parentId: string;
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
