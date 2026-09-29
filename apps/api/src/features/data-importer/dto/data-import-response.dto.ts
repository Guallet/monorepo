import { ApiProperty } from '@nestjs/swagger';

export class DataImportResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  processedCount: number;

  @ApiProperty()
  failedCount: number;
}
