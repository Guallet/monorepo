import { ApiProperty } from '@nestjs/swagger';

export class DataExportResponseDto {
  @ApiProperty({
    description:
      'Message indicating the export status and that an email will be sent',
    example: 'Processing data export',
  })
  message: string;
}
