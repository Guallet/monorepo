import { ApiProperty } from '@nestjs/swagger';

export interface CsvRowData {
  [key: string]: string | number | boolean | null | undefined;
}

export class FieldMappingsDto {
  @ApiProperty()
  account: string;
  @ApiProperty()
  date: string;
  @ApiProperty()
  amount: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  notes: string;
  @ApiProperty()
  category: string;
}

export class AccountMappingDto {
  @ApiProperty({ required: false })
  id?: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  shouldCreate: boolean;
}

export class CategoryMappingDto {
  @ApiProperty({ required: false })
  id?: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  shouldCreate: boolean;
}

export type FieldMappings = FieldMappingsDto;
export type AccountMapping = AccountMappingDto;
export type CategoryMapping = CategoryMappingDto;

export class CsvImportRequestDto {
  @ApiProperty({ type: [Object] })
  csvData: CsvRowData[];

  @ApiProperty({ type: () => FieldMappingsDto })
  fieldMappings: FieldMappingsDto;

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/AccountMappingDto' },
  })
  accountMappings: Record<string, AccountMappingDto>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/CategoryMappingDto' },
  })
  categoryMappings: Record<string, CategoryMappingDto>;
}
