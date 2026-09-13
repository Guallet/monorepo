import { ApiProperty } from '@nestjs/swagger';

type FieldMappingsSchema = FieldMappings;

export class CsvImportRequestDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: {
        oneOf: [
          { type: 'string', nullable: true },
          { type: 'number' },
          { type: 'boolean' },
        ],
      },
    },
  })
  csvData: CsvRowData[];
  @ApiProperty({ type: () => FieldMappings })
  fieldMappings: FieldMappingsSchema;
  @ApiProperty({
    type: Object,
    additionalProperties: { $ref: '#/components/schemas/AccountMapping' },
  })
  accountMappings: Record<string, AccountMapping>;
  @ApiProperty({
    type: Object,
    additionalProperties: { $ref: '#/components/schemas/CategoryMapping' },
  })
  categoryMappings: Record<string, CategoryMapping>;
}

export type CsvRowData = Record<
  string,
  string | number | boolean | null | undefined
>;

export class FieldMappings {
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

export class AccountMapping {
  @ApiProperty({ required: false, format: 'uuid' })
  id?: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  shouldCreate: boolean;
}

export class CategoryMapping {
  @ApiProperty({ required: false, format: 'uuid' })
  id?: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  shouldCreate: boolean;
}
