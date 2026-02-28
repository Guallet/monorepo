import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TransactionsService } from '../../transactions/transactions.service';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { DataExportRequestDto } from '../dto/data-export-request.dto';

export const JSON_EXPORT_QUEUE = 'json-export';
export const JSON_EXPORT_JOB = 'process-json-export';

type ExportRequestDto = Omit<DataExportRequestDto, 'format'>;

export interface JsonExportJobData {
  userId: string;
  dto: ExportRequestDto;
}

@Processor(JSON_EXPORT_QUEUE)
export class JsonExportProcessor extends WorkerHost {
  private readonly logger = new Logger(JsonExportProcessor.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(
    job: Job<JsonExportJobData>,
  ): Promise<{ transactionCount: number }> {
    const { userId, dto } = job.data;
    this.logger.log(`Processing JSON export job ${job.id} for user ${userId}`);

    try {
      const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
      const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const accounts = await this.accountsService.findAllUserAccounts(userId);
      const accountsMap = new Map(accounts.map((a) => [a.id, a.name]));
      const categories =
        await this.categoriesService.findAllUserCategories(userId);
      const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));

      const transactions =
        await this.transactionsService.getAllUserTransactionsForExport({
          userId,
          accounts: dto.accounts,
          startDate,
          endDate,
        });

      const jsonContent = JSON.stringify(
        transactions.map((tx) => ({
          id: tx.id,
          date: tx.date.toISOString(),
          account: accountsMap.get(tx.accountId) || tx.accountId,
          description: tx.description,
          amount: tx.amount,
          currency: tx.currency,
          notes: tx.notes || '',
          category: tx.categoryId ? categoriesMap.get(tx.categoryId) || '' : '',
        })),
        null,
        2,
      );

      await this.sendExportEmail(userId, jsonContent, transactions.length);
      await this.sendUserNotification(userId, false);

      this.logger.log(
        `JSON export job ${job.id} completed. Exported ${transactions.length} transactions.`,
      );
      return { transactionCount: transactions.length };
    } catch (error) {
      this.logger.error(
        `Error in JSON export job ${job.id} for user ${userId}`,
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

  private async sendExportEmail(
    userId: string,
    jsonContent: string,
    transactionCount: number,
  ): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
      return;
    }

    await this.emailService.sendExportCompletionEmail({
      to: user.email,
      userName: user.name || 'User',
      transactionCount,
      attachmentContent: jsonContent,
      attachmentFilename: `guallet-export-${new Date().toISOString().split('T')[0]}.json`,
      exportFormatLabel: 'JSON',
    });
  }

  private async sendErrorEmail(
    userId: string,
    errorMessage: string,
  ): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
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
    await this.notificationsService.createSystemNotification({
      userId,
      message: isError
        ? 'Export data finished with error'
        : 'Export data finished successfully',
      icon: isError ? '⚠️' : '🔔',
      type: isError ? NotificationType.IMPORTANT : NotificationType.INFO,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<JsonExportJobData>) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<JsonExportJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
