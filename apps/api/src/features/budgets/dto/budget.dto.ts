import { Budget } from '../entities/budget.entity';

export class BudgetDto {
  id: string;
  name: string;
  amount: number;
  spent: number;
  colour?: string;
  icon?: string;
  categories: string[];

  static fromDomain(domain: Budget, spent: number): BudgetDto {
    return {
      id: domain.id,
      name: domain.name,
      amount: domain.amount,
      spent: spent,
      colour: domain.colour,
      icon: domain.icon,
      categories: domain.categories,
    };
  }
}
