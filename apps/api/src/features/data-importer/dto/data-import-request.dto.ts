import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsString,
  MaxLength,
} from 'class-validator';
import type {
  CsvRowData,
  FieldMappings,
  AccountMapping,
  CategoryMapping,
} from './csv-import-request.dto.js';
import { DataFormat } from '../../data-formats.js';

/** All formats the import pipeline accepts. Alias of {@link DataFormat}. */
export type ImportFormat = DataFormat;

export class DataImportRequestDto {
  @ApiProperty({
    description: 'Import format',
    enum: ['csv', 'ofe', 'json'],
    example: 'csv',
  })
  @IsEnum(['csv', 'ofe', 'json'] as const)
  format: ImportFormat;

  // ── CSV-specific fields ─────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Rows of parsed CSV data (required for format=csv)',
  })
  @IsOptional()
  @IsArray()
  csvData?: CsvRowData[];

  @ApiPropertyOptional({
    description: 'Field mappings for CSV columns (required for format=csv)',
  })
  @IsOptional()
  @IsObject()
  fieldMappings?: FieldMappings;

  @ApiPropertyOptional({
    description: 'Account mappings (required for format=csv)',
  })
  @IsOptional()
  @IsObject()
  accountMappings?: Record<string, AccountMapping>;

  @ApiPropertyOptional({
    description: 'Category mappings (required for format=csv)',
  })
  @IsOptional()
  @IsObject()
  categoryMappings?: Record<string, CategoryMapping>;

  // ── OFE-specific fields ─────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Raw OFE/OFX file content (required for format=ofe)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10 * 1024 * 1024) // 10 MB max
  ofeContent?: string;

  // ── JSON-specific fields ────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Raw JSON content string (required for format=json)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10 * 1024 * 1024) // 10 MB max
  jsonContent?: string;
}
