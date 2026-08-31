import {
  BadRequestException,
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
import { DataImportRequestDto } from './dto/data-import-request.dto.js';
import { DataImportResponseDto } from './dto/data-import-response.dto.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import {
  IMPORT_DATA_QUEUE,
  IMPORT_DATA_JOB,
  SUPPORTED_IMPORT_FORMATS,
  ImportJobData,
} from './processors/import-data.processor.js';

@ApiTags('Data Import / Export')
@Controller('data')
export class DataImporterController {
  private readonly logger = new Logger(DataImporterController.name);

  constructor(
    @InjectQueue(IMPORT_DATA_QUEUE)
    private readonly importQueue: Queue<ImportJobData>,
  ) {}

  @Post('import')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Import job has been queued for processing',
    type: DataImportResponseDto,
  })
  async importData(
    @RequestUser() user: UserPrincipal,
    @Body() dto: DataImportRequestDto,
  ): Promise<DataImportResponseDto> {
    const format = dto.format || 'csv';

    if (!SUPPORTED_IMPORT_FORMATS.includes(format)) {
      throw new BadRequestException(
        `Unsupported import format "${format}". Supported formats: ${SUPPORTED_IMPORT_FORMATS.join(', ')}`,
      );
    }

    this.logger.log(
      `${format.toUpperCase()} import request from user ${user.id}, enqueueing job`,
    );

    const job = await this.importQueue.add(
      IMPORT_DATA_JOB,
      { userId: user.id, dto },
      {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log(
      `${format.toUpperCase()} import job ${job.id} queued for user ${user.id}`,
    );

    return {
      message: `${format.toUpperCase()} import started. You will receive an email when the import is complete.`,
      processedCount: 0,
      failedCount: 0,
    };
  }
}
