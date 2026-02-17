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
import { CsvExportRequestDto } from './dto/csv-export-request.dto';
import { CsvExportResponseDto } from './dto/csv-export-response.dto';
import { OfeExportRequestDto } from './dto/ofe-export-request.dto';
import { OfeExportResponseDto } from './dto/ofe-export-response.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import {
  CSV_EXPORT_QUEUE,
  CSV_EXPORT_JOB,
  CsvExportJobData,
} from './processors/csv-export.processor';
import {
  OFE_EXPORT_QUEUE,
  OFE_EXPORT_JOB,
  OfeExportJobData,
} from './processors/ofe-export.processor';

@ApiTags('Data Import / Export')
@Controller('data-exporter')
export class DataExporterController {
  private readonly logger = new Logger(DataExporterController.name);

  constructor(
    @InjectQueue(CSV_EXPORT_QUEUE)
    private readonly csvExportQueue: Queue<CsvExportJobData>,
    @InjectQueue(OFE_EXPORT_QUEUE)
    private readonly ofeExportQueue: Queue<OfeExportJobData>,
  ) {}

  @Post('csv')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'CSV export job has been queued for processing',
    type: CsvExportResponseDto,
  })
  async exportCsv(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CsvExportRequestDto,
  ): Promise<CsvExportResponseDto> {
    this.logger.log(`CSV export request from user ${user.id}, enqueueing job`);

    // Enqueue the export job for background processing
    const job = await this.csvExportQueue.add(
      CSV_EXPORT_JOB,
      { userId: user.id, dto },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log(`CSV export job ${job.id} queued for user ${user.id}`);

    return {
      message:
        'CSV export started. You will receive an email with the file when the export is complete.',
    };
  }

  @Post('ofe')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'OFE export job has been queued for processing',
    type: OfeExportResponseDto,
  })
  async exportOfe(
    @RequestUser() user: UserPrincipal,
    @Body() dto: OfeExportRequestDto,
  ): Promise<OfeExportResponseDto> {
    this.logger.log(`OFE export request from user ${user.id}, enqueueing job`);

    const job = await this.ofeExportQueue.add(
      OFE_EXPORT_JOB,
      { userId: user.id, dto },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log(`OFE export job ${job.id} queued for user ${user.id}`);

    return {
      message:
        'OFE export started. You will receive an email with the file when the export is complete.',
    };
  }
}
