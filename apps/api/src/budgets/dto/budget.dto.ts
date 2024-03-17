import { Budget } from '../entities/budget.entity';

export class BudgetDto {
  id: string;
  name: string;
  amount: number;
  colour?: string;
  icon?: string;
  categories: string[];

  static fromDomain(domain: Budget): BudgetDto {
    return {
      id: domain.id,
      name: domain.name,
      amount: domain.amount,
      colour: domain.colour,
      icon: domain.icon,
      categories: domain.categories,
    };
  }
}
