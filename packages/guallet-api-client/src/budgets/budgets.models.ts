export type BudgetDto = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  spent: number;
  colour?: string;
  icon?: string;
  categories: string[];
};

export type CreateBudgetRequest = {
  name: string;
  amount: number;
  currency: string;
  colour?: string;
  icon?: string;
  categories: string[];
};

export type UpdateBudgetRequest = {
  name?: string;
  amount?: number;
  currency?: string;
  colour?: string;
  icon?: string;
  categories?: string[];
};
