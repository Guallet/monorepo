import { ApiProperty } from '@nestjs/swagger';

export class DataImportResponseDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  processedCount: number;

  @ApiProperty()
  failedCount: number;
}
