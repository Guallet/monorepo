import { Account } from "../../accounts/models/Account";
import { Category } from "../../categories/models/Category";

export type Transaction = {
  id: string;
  accountId: string;
  account: Account | null;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  notes: string | null;
  categoryId: string | null;
  category: Category | null;
};

export type QueryMetadata = {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type TransactionQueryResult = {
  meta: QueryMetadata;
  transactions: Transaction[];
};
