import { ApiProperty } from '@nestjs/swagger';

export type ExportFormat = 'csv' | 'ofe' | 'json';

export class DataExportRequestDto {
  @ApiProperty({
    required: false,
    description: 'Start date for filtering transactions (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'End date for filtering transactions (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  endDate?: string;

  @ApiProperty({
    required: false,
    description:
      'List of account IDs to include. If empty, all accounts are included.',
    example: ['account-id-1', 'account-id-2'],
    type: [String],
  })
  accounts?: string[];

  @ApiProperty({
    required: false,
    description: 'Export format. Defaults to csv',
    enum: ['csv', 'ofe', 'json'],
    example: 'csv',
  })
  format?: ExportFormat;
}
