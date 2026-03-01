import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { DataFormat } from '../../data-formats';
import { DataImportRequestDto } from '../dto/data-import-request.dto';
import { ImportEngine } from '../engines/import-engine.interface';
import { CsvImportEngine } from '../engines/csv-import.engine';
import { OfeImportEngine } from '../engines/ofe-import.engine';
import { JsonImportEngine } from '../engines/json-import.engine';

export const IMPORT_DATA_QUEUE = 'import-data';
export const IMPORT_DATA_JOB = 'process-import';

export { SUPPORTED_DATA_FORMATS as SUPPORTED_IMPORT_FORMATS } from '../../data-formats';

export interface ImportJobData {
  userId: string;
  dto: DataImportRequestDto;
}

@Processor(IMPORT_DATA_QUEUE)
export class ImportDataProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportDataProcessor.name);

  /** Format → engine look-up populated in the constructor */
  private readonly engines: Record<DataFormat, ImportEngine>;

  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly csvEngine: CsvImportEngine,
    private readonly ofeEngine: OfeImportEngine,
    private readonly jsonEngine: JsonImportEngine,
  ) {
    super();
    this.engines = {
      csv: csvEngine,
      ofe: ofeEngine,
      json: jsonEngine,
    };
  }

  async process(
    job: Job<ImportJobData>,
  ): Promise<{ processed: number; failed: number }> {
    const { userId, dto } = job.data;

    let format = dto.format;
    if (!format) {
      this.logger.warn(
        `No format specified for import job ${job.id}, defaulting to CSV`,
      );
      format = 'csv';
    }

    this.logger.log(
      `Processing ${format.toUpperCase()} import job ${job.id} for user ${userId}`,
    );

    const engine = this.engines[format];
    if (!engine) {
      throw new Error(`Unsupported import format: ${format}`);
    }

    let processedCount = 0;
    let failedCount = 0;
    let errorMessage: string | null = null;

    try {
      const onProgress = async (percent: number) => {
        await job.updateProgress(percent);
      };

      const result = await engine.execute(userId, dto, onProgress);
      processedCount = result.processed;
      failedCount = result.failed;

      await this.sendNotificationEmail(
        userId,
        processedCount,
        failedCount,
        null,
      );
      await this.sendNotificationToUser(userId, null);

      this.logger.log(
        `${format.toUpperCase()} import job ${job.id} completed. Processed: ${processedCount}, Failed: ${failedCount}`,
      );
    } catch (error) {
      this.logger.error(
        `Error in ${format.toUpperCase()} import job ${job.id} for user ${userId}`,
        error,
      );
      errorMessage = error instanceof Error ? error.message : String(error);

      await this.sendNotificationEmail(userId, 0, 0, errorMessage);
      await this.sendNotificationToUser(userId, errorMessage);

      throw error;
    }

    return { processed: processedCount, failed: failedCount };
  }

  private async sendNotificationEmail(
    userId: string,
    processedCount: number,
    failedCount: number,
    errorMessage: string | null,
  ): Promise<void> {
    try {
      const user = await this.usersService.findUserData(userId);
      if (!user?.email) {
        this.logger.warn(`Cannot send email – user ${userId} has no email`);
        return;
      }

      if (errorMessage) {
        await this.emailService.sendImportErrorEmail({
          to: user.email,
          userName: user.name || 'User',
          errorMessage,
        });
      } else {
        await this.emailService.sendImportCompletionEmail({
          to: user.email,
          userName: user.name || 'User',
          processedCount,
          failedCount,
        });
      }
    } catch (error) {
      this.logger.error('Failed to send notification email', error);
    }
  }

  private async sendNotificationToUser(
    userId: string,
    errorMessage: string | null,
  ): Promise<void> {
    try {
      await this.notificationsService.createSystemNotification({
        userId,
        message: errorMessage
          ? 'Import data finished with error'
          : 'Import data finished successfully',
        icon: errorMessage ? '⚠️' : '🔔',
        type: errorMessage ? NotificationType.IMPORTANT : NotificationType.INFO,
      });
    } catch (error) {
      this.logger.error('Failed to create import notification', error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ImportJobData>) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ImportJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
