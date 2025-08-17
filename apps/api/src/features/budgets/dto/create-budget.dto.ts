export class CreateBudgetDto {
  name: string;
  amount: number;
  currency: string;
  colour?: string;
  icon?: string;
  categories: string[];
}
