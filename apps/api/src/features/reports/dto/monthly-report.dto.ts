import { ApiProperty } from '@nestjs/swagger';

export class MonthlyReportCategoryDto {
  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  categoryId: string | null;

  @ApiProperty()
  categoryName: string;

  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  parentId: string | null;

  @ApiProperty({
    description:
      'Positive inflows assigned directly to this category, as a decimal string.',
  })
  income: string;

  @ApiProperty({
    description:
      'Magnitude of negative outflows assigned directly to this category, as a positive decimal string.',
  })
  expenses: string;

  @ApiProperty()
  transactionCount: number;
}

export class MonthlyReportCurrencyDto {
  @ApiProperty({ example: 'GBP' })
  currency: string;

  @ApiProperty({
    description:
      'Total positive transaction amounts, including refunds and transfers.',
  })
  income: string;

  @ApiProperty({
    description:
      'Absolute total of negative transaction amounts, including transfers.',
  })
  expenses: string;

  @ApiProperty({
    description: 'Income minus expenses. No currency conversion is applied.',
  })
  net: string;

  @ApiProperty()
  transactionCount: number;

  @ApiProperty({ type: [MonthlyReportCategoryDto] })
  categories: MonthlyReportCategoryDto[];
}

export class MonthlyReportDto {
  @ApiProperty()
  year: number;

  @ApiProperty({ minimum: 1, maximum: 12 })
  month: number;

  @ApiProperty({ type: [MonthlyReportCurrencyDto] })
  currencies: MonthlyReportCurrencyDto[];
}
