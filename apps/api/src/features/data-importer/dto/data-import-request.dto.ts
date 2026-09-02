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
  AccountMappingDto,
  FieldMappingsDto,
  CategoryMappingDto,
} from './csv-import-request.dto.js';
import type {
  AccountMapping,
  CategoryMapping,
  CsvRowData,
  FieldMappings,
} from './csv-import-request.dto.js';
import { DataFormat } from '../../data-formats.js';

/** All formats the import pipeline accepts. Alias of {@link DataFormat}. */
export type ImportFormat = DataFormat;

@ApiExtraModels(FieldMappingsDto, AccountMappingDto, CategoryMappingDto)
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
    description: 'Rows of parsed CSV data (required for format=csv)',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  csvData?: CsvRowData[];

  @ApiProperty({
    required: false,
    description: 'Field mappings for CSV columns (required for format=csv)',
    type: () => FieldMappingsDto,
  })
  @IsOptional()
  @IsObject()
  fieldMappings?: FieldMappings;

  @ApiProperty({
    required: false,
    description: 'Account mappings (required for format=csv)',
    type: Object,
    additionalProperties: { $ref: '#/components/schemas/AccountMappingDto' },
  })
  @IsOptional()
  @IsObject()
  accountMappings?: Record<string, AccountMapping>;

  @ApiProperty({
    required: false,
    description: 'Category mappings (required for format=csv)',
    type: Object,
    additionalProperties: { $ref: '#/components/schemas/CategoryMappingDto' },
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
