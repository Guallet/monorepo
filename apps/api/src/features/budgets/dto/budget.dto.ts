import { Budget } from '../entities/budget.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class BudgetDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  amount: number;
  @ApiProperty()
  currency: string;
  @ApiProperty()
  spent: number;
  @ApiProperty({ required: false })
  colour?: string;
  @ApiProperty({ required: false })
  icon?: string;
  @ApiProperty({ type: [String] })
  categories: string[];

  static fromDomain(domain: Budget, spent: number): BudgetDto {
    return {
      id: domain.id,
      name: domain.name,
      amount: domain.amount,
      currency: domain.currency,
      spent: spent,
      colour: domain.colour,
      icon: domain.icon,
      categories: domain.categories.map((category) => category.id),
    };
  }
}
