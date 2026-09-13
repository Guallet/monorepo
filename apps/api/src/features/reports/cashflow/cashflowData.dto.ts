import { ApiProperty } from '@nestjs/swagger';

export class CashflowDataDto {
  @ApiProperty()
  year: number;
  @ApiProperty()
  totalTransactions: number;
  @ApiProperty({ type: () => [CategoryDataRowDto] })
  data: CategoryDataRowDto[];
}

export class CategoryDataRowDto {
  @ApiProperty({ format: 'uuid', nullable: true })
  categoryId: string | null;
  @ApiProperty()
  categoryName: string;
  @ApiProperty()
  isParent: boolean;
  @ApiProperty()
  totalTransactions: number;
  @ApiProperty({ type: [String] })
  values: string[];
  @ApiProperty({ type: () => [SubCategoryDataRow] })
  subcategories: SubCategoryDataRow[];
}

export class SubCategoryDataRow {
  @ApiProperty({ format: 'uuid' })
  categoryId: string;
  @ApiProperty()
  categoryName: string;
  @ApiProperty()
  totalTransactions: number;
  @ApiProperty({ type: [String] })
  values: string[];
}
