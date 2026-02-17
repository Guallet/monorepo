import { ApiPropertyOptional } from '@nestjs/swagger';

export class OfeExportRequestDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering transactions (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering transactions (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  endDate?: string;

  @ApiPropertyOptional({
    description:
      'List of account IDs to include. If empty, all accounts are included.',
    example: ['account-id-1', 'account-id-2'],
    type: [String],
  })
  accounts?: string[];
}
