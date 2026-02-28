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
  CSV_EXPORT_QUEUE,
  CSV_EXPORT_JOB,
  CsvExportJobData,
} from './processors/csv-export.processor';
import {
  OFE_EXPORT_QUEUE,
  OFE_EXPORT_JOB,
  OfeExportJobData,
} from './processors/ofe-export.processor';
import {
  JSON_EXPORT_QUEUE,
  JSON_EXPORT_JOB,
  JsonExportJobData,
} from './processors/json-export.processor';

@ApiTags('Data Import / Export')
@Controller('data')
export class DataExporterController {
  private readonly logger = new Logger(DataExporterController.name);

  constructor(
    @InjectQueue(CSV_EXPORT_QUEUE)
    private readonly csvExportQueue: Queue<CsvExportJobData>,
    @InjectQueue(OFE_EXPORT_QUEUE)
    private readonly ofeExportQueue: Queue<OfeExportJobData>,
    @InjectQueue(JSON_EXPORT_QUEUE)
    private readonly jsonExportQueue: Queue<JsonExportJobData>,
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
    const { format = 'csv', ...exportDto } = dto;
    this.logger.log(
      `${format.toUpperCase()} export request from user ${user.id}, enqueueing job`,
    );

    const queueByFormat = {
      csv: this.csvExportQueue,
      ofe: this.ofeExportQueue,
      json: this.jsonExportQueue,
    } as const;
    const jobNameByFormat = {
      csv: CSV_EXPORT_JOB,
      ofe: OFE_EXPORT_JOB,
      json: JSON_EXPORT_JOB,
    } as const;
    const messageByFormat = (fmt: typeof format) =>
      `${fmt.toUpperCase()} export started. You will receive an email with the file when the export is complete.`;

    const queue = queueByFormat[format];
    const jobName = jobNameByFormat[format];

    const job = await queue.add(
      jobName,
      { userId: user.id, dto: exportDto },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log(
      `${format.toUpperCase()} export job ${job.id} queued for user ${user.id}`,
    );

    return {
      message: messageByFormat(format),
    };
  }
}
