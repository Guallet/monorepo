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
import { CsvImportRequestDto } from './dto/csv-import-request.dto';
import { CsvImportResponseDto } from './dto/csv-import-response.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import {
  CSV_IMPORT_QUEUE,
  CSV_IMPORT_JOB,
  CsvImportJobData,
} from './processors/csv-import.processor';

@ApiTags('Data Import / Export')
@Controller('data-importer')
export class DataImporterController {
  private readonly logger = new Logger(DataImporterController.name);

  constructor(
    @InjectQueue(CSV_IMPORT_QUEUE)
    private readonly csvImportQueue: Queue<CsvImportJobData>,
  ) {}

  @Post('csv')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'CSV import job has been queued for processing',
    type: CsvImportResponseDto,
  })
  async importCsv(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CsvImportRequestDto,
  ): Promise<CsvImportResponseDto> {
    this.logger.log(`CSV import request from user ${user.id}, enqueueing job`);

    // Enqueue the import job for background processing
    const job = await this.csvImportQueue.add(
      CSV_IMPORT_JOB,
      { userId: user.id, dto, format: 'csv' },
      {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
      },
    );

    this.logger.log(`CSV import job ${job.id} queued for user ${user.id}`);

    return {
      message:
        'CSV import started. You will receive an email when the import is complete.',
      processedCount: 0,
      failedCount: 0,
    };
  }

  @Post('ofe')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'OFE import job has been queued for processing',
    type: CsvImportResponseDto,
  })
  async importOfe(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CsvImportRequestDto,
  ): Promise<CsvImportResponseDto> {
    this.logger.log(`OFE import request from user ${user.id}, enqueueing job`);

    const job = await this.csvImportQueue.add(
      CSV_IMPORT_JOB,
      { userId: user.id, dto, format: 'ofe' },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log(`OFE import job ${job.id} queued for user ${user.id}`);

    return {
      message:
        'OFE import started. You will receive an email when the import is complete.',
      processedCount: 0,
      failedCount: 0,
    };
  }
}
