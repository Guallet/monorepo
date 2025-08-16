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
