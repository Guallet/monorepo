import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TransactionsService } from '../../transactions/transactions.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { DataExportRequestDto } from '../dto/data-export-request.dto';
import { ExportEngine } from '../engines/export-engine.interface';
import { CsvExportEngine } from '../engines/csv-export.engine';
import { OfeExportEngine } from '../engines/ofe-export.engine';
import { JsonExportEngine } from '../engines/json-export.engine';
import { DataFormat } from '../../data-formats';

export const EXPORT_DATA_QUEUE = 'export-data';
export const EXPORT_DATA_JOB = 'process-export';
export { SUPPORTED_DATA_FORMATS as SUPPORTED_EXPORT_FORMATS } from '../../data-formats';

/** All formats the export pipeline accepts. Alias of {@link DataFormat}. */
export type ExportFormat = DataFormat;

export interface ExportJobData {
  userId: string;
  dto: DataExportRequestDto;
}

@Processor(EXPORT_DATA_QUEUE)
export class ExportDataProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportDataProcessor.name);

  /** Format → engine look-up populated in the constructor */
  private readonly engines: Record<ExportFormat, ExportEngine>;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly csvEngine: CsvExportEngine,
    private readonly ofeEngine: OfeExportEngine,
    private readonly jsonEngine: JsonExportEngine,
  ) {
    super();
    this.engines = {
      csv: csvEngine,
      ofe: ofeEngine,
      json: jsonEngine,
    };
  }

  async process(
    job: Job<ExportJobData>,
  ): Promise<{ transactionCount: number }> {
    const { userId, dto } = job.data;

    // Get export format, default to CSV if not specified
    let format = dto.format;
    if (!format) {
      this.logger.warn(
        `No format specified for export job ${job.id}, defaulting to CSV`,
      );
      format = 'csv';
    }

    this.logger.log(
      `Processing ${format.toUpperCase()} export job ${job.id} for user ${userId}`,
    );

    const engine = this.engines[format];
    if (!engine) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    try {
      // Parse date filters
      const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
      const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      // Fetch accounts & categories (both cheap – always fetch)
      const accounts = await this.accountsService.findAllUserAccounts(userId);
      const accountsMap = new Map(accounts.map((a) => [a.id, a.name]));

      const categories =
        await this.categoriesService.findAllUserCategories(userId);
      const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));

      // Fetch transactions matching the filters
      const transactions =
        await this.transactionsService.getAllUserTransactionsForExport({
          userId,
          accounts: dto.accounts,
          startDate,
          endDate,
        });

      // Delegate content generation to the format-specific engine
      const content = engine.generateContent({
        transactions,
        accountsMap,
        categoriesMap,
      });

      // Send email with attachment
      await this.sendExportEmail({
        userId,
        content,
        transactionCount: transactions.length,
        filename: `guallet-export-${new Date().toISOString().split('T')[0]}${engine.fileExtension}`,
        formatLabel: engine.formatLabel,
      });

      await this.sendUserNotification(userId, false);

      this.logger.log(
        `${format.toUpperCase()} export job ${job.id} completed. Exported ${transactions.length} transactions.`,
      );

      return { transactionCount: transactions.length };
    } catch (error) {
      this.logger.error(
        `Error in ${format.toUpperCase()} export job ${job.id} for user ${userId}`,
        error,
      );

      await this.sendErrorEmail(
        userId,
        error instanceof Error ? error.message : String(error),
      );
      await this.sendUserNotification(userId, true);

      throw error;
    }
  }

  private async sendExportEmail({
    userId,
    content,
    transactionCount,
    filename,
    formatLabel,
  }: {
    userId: string;
    content: string;
    transactionCount: number;
    filename: string;
    formatLabel: string;
  }): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
      this.logger.warn(`Cannot send email – user ${userId} has no email`);
      return;
    }

    await this.emailService.sendExportCompletionEmail({
      to: user.email,
      userName: user.name || 'User',
      transactionCount,
      attachmentContent: content,
      attachmentFilename: filename,
      exportFormatLabel: formatLabel,
    });
  }

  private async sendErrorEmail(
    userId: string,
    errorMessage: string,
  ): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
      this.logger.warn(`Cannot send email – user ${userId} has no email`);
      return;
    }

    await this.emailService.sendExportErrorEmail({
      to: user.email,
      userName: user.name || 'User',
      errorMessage,
    });
  }

  private async sendUserNotification(
    userId: string,
    isError: boolean,
  ): Promise<void> {
    try {
      await this.notificationsService.createSystemNotification({
        userId,
        message: isError
          ? 'Export data finished with error'
          : 'Export data finished successfully',
        icon: isError ? '⚠️' : '🔔',
        type: isError ? NotificationType.IMPORTANT : NotificationType.INFO,
      });
    } catch (error) {
      this.logger.error('Failed to create export notification', error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ExportJobData>) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ExportJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
