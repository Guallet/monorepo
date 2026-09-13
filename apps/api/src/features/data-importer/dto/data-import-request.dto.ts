import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  CsvRowData,
  FieldMappings,
  AccountMapping,
  CategoryMapping,
} from './csv-import-request.dto';
import { DataFormat } from '../../data-formats';

/** All formats the import pipeline accepts. Alias of {@link DataFormat}. */
export type ImportFormat = DataFormat;

@ApiExtraModels(FieldMappings, AccountMapping, CategoryMapping)
export class DataImportRequestDto {
  @ApiProperty({
    description: 'Import format',
    enum: ['csv', 'ofe', 'json'],
    example: 'csv',
  })
  @IsEnum(['csv', 'ofe', 'json'] as const)
  format: ImportFormat;

  // ── CSV-specific fields ─────────────────────────────────────────────

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: {
        oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
        nullable: true,
      },
    },
    description: 'Rows of parsed CSV data (required for format=csv)',
  })
  @IsOptional()
  @IsArray()
  csvData?: CsvRowData[];

  @ApiProperty({
    required: false,
    type: () => FieldMappings,
    description: 'Field mappings for CSV columns (required for format=csv)',
  })
  @IsOptional()
  @IsObject()
  fieldMappings?: FieldMappings;

  @ApiProperty({
    required: false,
    type: Object,
    additionalProperties: { $ref: '#/components/schemas/AccountMapping' },
    description: 'Account mappings (required for format=csv)',
  })
  @IsOptional()
  @IsObject()
  accountMappings?: Record<string, AccountMapping>;

  @ApiProperty({
    required: false,
    type: Object,
    additionalProperties: { $ref: '#/components/schemas/CategoryMapping' },
    description: 'Category mappings (required for format=csv)',
  })
  @IsOptional()
  @IsObject()
  categoryMappings?: Record<string, CategoryMapping>;

  // ── OFE-specific fields ─────────────────────────────────────────────

  @ApiProperty({
    required: false,
    description: 'Raw OFE/OFX file content (required for format=ofe)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10 * 1024 * 1024) // 10 MB max
  ofeContent?: string;

  // ── JSON-specific fields ────────────────────────────────────────────

  @ApiProperty({
    required: false,
    description: 'Raw JSON content string (required for format=json)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10 * 1024 * 1024) // 10 MB max
  jsonContent?: string;
}
