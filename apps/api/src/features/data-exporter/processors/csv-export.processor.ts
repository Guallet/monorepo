import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TransactionsService } from '../../transactions/transactions.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { DataExportRequestDto } from '../dto/data-export-request.dto';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

export const CSV_EXPORT_QUEUE = 'csv-export';
export const CSV_EXPORT_JOB = 'process-csv-export';

export interface CsvExportJobData {
  userId: string;
  dto: DataExportRequestDto;
}

@Processor(CSV_EXPORT_QUEUE)
export class CsvExportProcessor extends WorkerHost {
  private readonly logger = new Logger(CsvExportProcessor.name);

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
    job: Job<CsvExportJobData>,
  ): Promise<{ transactionCount: number }> {
    const { userId, dto } = job.data;
    this.logger.log(`Processing CSV export job ${job.id} for user ${userId}`);

    try {
      // Parse date filters
      const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
      const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      // Get all user accounts for mapping
      const accounts = await this.accountsService.findAllUserAccounts(userId);
      const accountsMap = new Map(accounts.map((a) => [a.id, a.name]));

      // Get all user categories for mapping
      const categories =
        await this.categoriesService.findAllUserCategories(userId);
      const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));

      // Fetch all transactions matching the filters (without pagination)
      const transactions =
        await this.transactionsService.getAllUserTransactionsForExport({
          userId,
          accounts: dto.accounts,
          startDate,
          endDate,
        });

      // Generate CSV content
      const csvContent = this.generateCsvContent({
        transactions,
        accountsMap,
        categoriesMap,
      });

      // Send email with CSV attachment
      await this.sendExportEmail(userId, csvContent, transactions.length);
      await this.sendUserNotification({
        userId,
        isError: false,
        transactionCount: transactions.length,
      });

      this.logger.log(
        `CSV export job ${job.id} completed. Exported ${transactions.length} transactions.`,
      );

      return { transactionCount: transactions.length };
    } catch (error) {
      this.logger.error(
        `Error in CSV export job ${job.id} for user ${userId}`,
        error,
      );

      // Send error notification
      await this.sendErrorEmail(
        userId,
        error instanceof Error ? error.message : String(error),
      );
      await this.sendUserNotification({
        userId,
        isError: true,
      });

      throw error;
    }
  }

  private generateCsvContent({
    transactions,
    accountsMap,
    categoriesMap,
  }: {
    transactions: Array<{
      id: string;
      accountId: string;
      description: string;
      notes?: string;
      amount: number;
      currency: string;
      date: Date;
      categoryId?: string | null;
    }>;
    accountsMap: Map<string, string>;
    categoriesMap: Map<string, string>;
  }): string {
    const headers = [
      'Date',
      'Account',
      'Description',
      'Amount',
      'Currency',
      'Notes',
      'Category',
    ];

    const rows = transactions.map((tx) => {
      const accountName = accountsMap.get(tx.accountId) || tx.accountId;
      const categoryName = tx.categoryId
        ? categoriesMap.get(tx.categoryId) || ''
        : '';

      return [
        this.formatDate(tx.date),
        this.escapeCsvField(accountName),
        this.escapeCsvField(tx.description || ''),
        tx.amount.toString(),
        tx.currency,
        this.escapeCsvField(tx.notes || ''),
        this.escapeCsvField(categoryName),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private escapeCsvField(field: string): string {
    // Escape quotes by doubling them and wrap in quotes if contains special chars
    // Check for: comma, double quote, newline, carriage return, or leading/trailing whitespace
    if (
      field.includes(',') ||
      field.includes('"') ||
      field.includes('\n') ||
      field.includes('\r') ||
      field.trim() !== field
    ) {
      return `"${field.replaceAll('"', '""')}"`;
    }
    return field;
  }

  private async sendExportEmail(
    userId: string,
    csvContent: string,
    transactionCount: number,
  ): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
      this.logger.warn(`Cannot send email - user ${userId} has no email`);
      return;
    }

    await this.emailService.sendExportCompletionEmail({
      to: user.email,
      userName: user.name || 'User',
      transactionCount,
      csvContent,
    });
  }

  private async sendErrorEmail(
    userId: string,
    errorMessage: string,
  ): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
      this.logger.warn(`Cannot send email - user ${userId} has no email`);
      return;
    }

    await this.emailService.sendExportErrorEmail({
      to: user.email,
      userName: user.name || 'User',
      errorMessage,
    });
  }

  private async sendUserNotification({
    userId,
    isError,
  }: {
    userId: string;
    isError: boolean;
    transactionCount?: number;
  }): Promise<void> {
    try {
      if (isError) {
        await this.notificationsService.createSystemNotification({
          userId,
          message: 'Export data finished with error',
          icon: '⚠️',
          type: NotificationType.IMPORTANT,
        });
        return;
      }

      await this.notificationsService.createSystemNotification({
        userId,
        message: 'Export data finished successfully',
        icon: '🔔',
        type: NotificationType.INFO,
      });
    } catch (error) {
      this.logger.error('Failed to create export notification', error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<CsvExportJobData>) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<CsvExportJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
