import { ApiProperty } from '@nestjs/swagger';

export class CsvExportResponseDto {
  @ApiProperty({
    description:
      'Message indicating the export status and that an email will be sent',
    example: 'Processing CSV export',
  })
  message: string;
}
