import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataExportRequestDto } from './dto/data-export-request.dto';
import { DataExportResponseDto } from './dto/data-export-response.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import {
  EXPORT_DATA_QUEUE,
  EXPORT_DATA_JOB,
  ExportJobData,
} from './processors/export-data.processor';

@ApiTags('Data Import / Export')
@Controller('data')
export class DataExporterController {
  private readonly logger = new Logger(DataExporterController.name);

  constructor(
    @InjectQueue(EXPORT_DATA_QUEUE)
    private readonly exportQueue: Queue<ExportJobData>,
  ) {}

  @Post('export')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Export job has been queued for processing',
    type: DataExportResponseDto,
  })
  async exportData(
    @RequestUser() user: UserPrincipal,
    @Body() dto: DataExportRequestDto,
  ): Promise<DataExportResponseDto> {
    const { format = 'csv' } = dto;
    this.logger.log(
      `${format.toUpperCase()} export request from user ${user.id}, enqueueing job`,
    );

    const job = await this.exportQueue.add(
      EXPORT_DATA_JOB,
      { userId: user.id, dto: dto },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log(
      `${format.toUpperCase()} export job ${job.id} queued for user ${user.id}`,
    );

    return {
      message: `${format.toUpperCase()} export started. You will receive an email with the file when the export is complete.`,
    };
  }
}
