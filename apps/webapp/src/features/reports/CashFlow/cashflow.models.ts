export type CashflowDataDto = {
  year: number;
  totalTransactions: number;
  data: CategoryDataRowDto[];
};

export type CategoryDataRowDto = {
  categoryId: string;
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
