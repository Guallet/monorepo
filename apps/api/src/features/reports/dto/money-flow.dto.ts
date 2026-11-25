import { ApiProperty } from '@nestjs/swagger';

export class MoneyFlowCategoryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;
}

export class MoneyFlowRowDto {
  @ApiProperty({ description: 'Transaction currency code' })
  currency: string;

  @ApiProperty({ type: () => MoneyFlowCategoryDto, nullable: true })
  category: MoneyFlowCategoryDto | null;

  @ApiProperty({ type: () => MoneyFlowCategoryDto, nullable: true })
  subcategory: MoneyFlowCategoryDto | null;

  @ApiProperty({ description: 'Gross inflow as a decimal string' })
  moneyIn: string;

  @ApiProperty({
    description: 'Gross outflow as an unsigned decimal string',
  })
  moneyOut: string;
}

export class MoneyFlowReportDto {
  @ApiProperty({ type: () => [MoneyFlowRowDto] })
  rows: MoneyFlowRowDto[];
}
