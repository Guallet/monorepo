import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Param,
  NotFoundException,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataImportRequestDto } from './dto/data-import-request.dto';
import { DataImportResponseDto } from './dto/data-import-response.dto';
import { DataImportStatusDto } from './dto/data-import-status.dto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import {
  IMPORT_DATA_QUEUE,
  IMPORT_DATA_JOB,
  SUPPORTED_IMPORT_FORMATS,
  ImportJobData,
} from './processors/import-data.processor';

@ApiTags('Data Import / Export')
@Controller('data')
export class DataImporterController {
  private readonly logger = new Logger(DataImporterController.name);

  constructor(
    @InjectQueue(IMPORT_DATA_QUEUE)
    private readonly importQueue: Queue<ImportJobData>,
  ) {}

  @ApiOperation({ summary: 'importData' })
  @ApiBody({ type: () => DataImportRequestDto })
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
      jobId: String(job.id),
      message: `${format.toUpperCase()} import started. You will receive an email when the import is complete.`,
      processedCount: 0,
      failedCount: 0,
    };
  }

  @Get('import/:jobId')
  @ApiOperation({ summary: 'Get import job status' })
  @ApiParam({ name: 'jobId', type: String })
  @ApiResponse({ status: 200, type: DataImportStatusDto })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async getImportStatus(
    @RequestUser() user: UserPrincipal,
    @Param('jobId') jobId: string,
  ): Promise<DataImportStatusDto> {
    const job = await this.importQueue.getJob(jobId);
    if (!job || job.data.userId !== user.id) {
      throw new NotFoundException('Import job not found');
    }

    const state = await job.getState();
    const result = job.returnvalue as
      | { processed?: number; failed?: number }
      | undefined;
    let status: DataImportStatusDto['status'] = 'queued';
    if (state === 'active') status = 'running';
    if (state === 'completed') status = 'completed';
    if (state === 'failed') status = 'failed';

    return {
      status,
      progress: typeof job.progress === 'number' ? job.progress : 0,
      processedCount: result?.processed ?? 0,
      failedCount: result?.failed ?? 0,
      ...(status === 'failed' && job.failedReason
        ? { error: 'The import could not be completed.' }
        : {}),
    };
  }
}
