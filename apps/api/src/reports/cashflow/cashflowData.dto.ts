export class CashflowDataDto {
  year: number;
  totalTransactions: number;
  data: CategoryDataRowDto[];
}

export class CategoryDataRowDto {
  categoryId: string;
  categoryName: string;
  isParent: boolean;
  totalTransactions: number;
  values: string[];
  subcategories: SubCategoryDataRow[];
}

export class SubCategoryDataRow {
  categoryId: string;
  categoryName: string;
  totalTransactions: number;
  values: string[];
}
