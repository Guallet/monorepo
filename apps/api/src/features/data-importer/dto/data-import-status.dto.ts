import { ApiProperty } from '@nestjs/swagger';

export class DataImportStatusDto {
  @ApiProperty({ enum: ['queued', 'running', 'completed', 'failed'] })
  status: 'queued' | 'running' | 'completed' | 'failed';

  @ApiProperty()
  progress: number;

  @ApiProperty()
  processedCount: number;

  @ApiProperty()
  failedCount: number;

  @ApiProperty({ required: false })
  error?: string;
}
