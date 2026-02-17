import { ApiProperty } from '@nestjs/swagger';

export class OfeExportResponseDto {
  @ApiProperty({
    description:
      'Message indicating the export status and that an email will be sent',
    example: 'Processing OFE export',
  })
  message: string;
}
