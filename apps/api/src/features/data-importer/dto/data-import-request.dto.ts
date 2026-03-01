import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CsvRowData,
  FieldMappings,
  AccountMapping,
  CategoryMapping,
} from './csv-import-request.dto';

export type ImportFormat = 'csv' | 'ofe' | 'json';

export class DataImportRequestDto {
  @ApiProperty({
    description: 'Import format',
    enum: ['csv', 'ofe', 'json'],
    example: 'csv',
  })
  format: ImportFormat;

  // ── CSV-specific fields ─────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Rows of parsed CSV data (required for format=csv)',
  })
  csvData?: CsvRowData[];

  @ApiPropertyOptional({
    description: 'Field mappings for CSV columns (required for format=csv)',
  })
  fieldMappings?: FieldMappings;

  @ApiPropertyOptional({
    description: 'Account mappings (required for format=csv)',
  })
  accountMappings?: Record<string, AccountMapping>;

  @ApiPropertyOptional({
    description: 'Category mappings (required for format=csv)',
  })
  categoryMappings?: Record<string, CategoryMapping>;

  // ── OFE-specific fields ─────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Raw OFE/OFX file content (required for format=ofe)',
  })
  ofeContent?: string;

  // ── JSON-specific fields ────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Raw JSON content string (required for format=json)',
  })
  jsonContent?: string;
}
