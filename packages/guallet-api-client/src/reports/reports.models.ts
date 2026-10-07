export type CashflowDataDto = {
  year: number;
  totalTransactions: number;
  data: CategoryDataRowDto[];
};

export type CategoryDataRowDto = {
  categoryId: string | null;
  categoryName: string;
  isParent: boolean;
  totalTransactions: number;
  values: string[];
  subcategories: SubCategoryDataRow[];
};

export type SubCategoryDataRow = {
  categoryId: string;
  categoryName: string;
  totalTransactions: number;
  values: string[];
};

export type MonthlyReportRequest = {
  year: number;
  /** Calendar month, 1–12, in UTC. */
  month: number;
  accounts?: string[];
  /** Selected categories and their descendants. Omit for all. */
  categories?: string[];
};

export type MonthlyReportCategoryDto = {
  categoryId: string | null;
  categoryName: string;
  parentId: string | null;
  /** Gross positive amounts assigned directly to this category. */
  income: string;
  /** Magnitude of negative amounts assigned directly to this category. */
  expenses: string;
  transactionCount: number;
};

export type MonthlyReportCurrencyDto = {
  currency: string;
  income: string;
  expenses: string;
  net: string;
  transactionCount: number;
  categories: MonthlyReportCategoryDto[];
};

export type MonthlyReportDto = {
  year: number;
  month: number;
  currencies: MonthlyReportCurrencyDto[];
};
