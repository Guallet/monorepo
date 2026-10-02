import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export type ExportFormat = 'csv' | 'ofe' | 'json';

export class DataExportRequestDto {
  @IsOptional()
  @IsISO8601()
  @ApiProperty({
    required: false,
    format: 'date-time',
    description: 'Start date for filtering transactions (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  @ApiProperty({
    required: false,
    format: 'date-time',
    description: 'End date for filtering transactions (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    required: false,
    description:
      'List of account IDs to include. If empty, all accounts are included.',
    example: ['account-id-1', 'account-id-2'],
    type: [String],
  })
  accounts?: string[];

  @IsOptional()
  @IsIn(['csv', 'ofe', 'json'])
  @ApiProperty({
    required: false,
    description: 'Export format. Defaults to csv',
    enum: ['csv', 'ofe', 'json'],
    example: 'csv',
  })
  format?: ExportFormat;
}
