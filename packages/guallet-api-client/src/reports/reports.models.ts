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

export type MoneyFlowFilters = {
  startDate: Date;
  endDate: Date;
  accounts?: string[];
};

export type MoneyFlowCategoryDto = {
  id: string;
  name: string;
};

export type MoneyFlowRowDto = {
  currency: string;
  category: MoneyFlowCategoryDto | null;
  subcategory: MoneyFlowCategoryDto | null;
  moneyIn: string;
  moneyOut: string;
};

export type MoneyFlowReportDto = {
  rows: MoneyFlowRowDto[];
};
