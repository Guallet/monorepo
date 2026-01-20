import { ApiProperty } from '@nestjs/swagger';

export class CsvExportResponseDto {
  @ApiProperty({
    description:
      'Message indicating the export status and that an email will be sent',
    example:
      'CSV export started. You will receive an email with the file when the export is complete.',
  })
  message: string;
}
