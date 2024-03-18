export type BudgetDto = {
  id: string;
  name: string;
  amount: number;
  spent: number;
  colour?: string;
  icon?: string;
  categories: string[];
};
