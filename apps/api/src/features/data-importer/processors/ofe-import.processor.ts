import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { AccountsService } from '../../accounts/accounts.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { OfeImportRequestDto } from '../dto/ofe-import-request.dto';
import { DEFAULT_CURRENCY } from '../constants/import-defaults';
import { AccountType } from 'src/features/accounts/entities/accountType.model';
import { AccountSource } from 'src/features/accounts/entities/accountSource.model';

export const OFE_IMPORT_QUEUE = 'ofe-import';
export const OFE_IMPORT_JOB = 'process-ofe-import';

export interface OfeImportJobData {
  userId: string;
  dto: OfeImportRequestDto;
}

interface ParsedOfeTransaction {
  date: Date;
  amount: number;
  description: string;
  notes: string;
}

@Processor(OFE_IMPORT_QUEUE)
export class OfeImportProcessor extends WorkerHost {
  private readonly logger = new Logger(OfeImportProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsService: AccountsService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(
    job: Job<OfeImportJobData>,
  ): Promise<{ processed: number; failed: number }> {
    const { userId, dto } = job.data;
    this.logger.log(`Processing OFE import job ${job.id} for user ${userId}`);

    let processedCount = 0;
    let failedCount = 0;
    let errorMessage: string | null = null;

    try {
      const defaultCurrency = await this.getUserDefaultCurrency(userId);
      const accountId = await this.resolveAccountId(userId, dto.ofeContent);
      const parsedTransactions = this.parseOfeTransactions(dto.ofeContent);

      const validTransactions = parsedTransactions.filter((tx) => {
        if (Number.isNaN(tx.amount) || Number.isNaN(tx.date.getTime())) {
          failedCount++;
          return false;
        }
        return true;
      });

      if (validTransactions.length > 0) {
        const repository = this.dataSource.getRepository(Transaction);
        await repository.save(
          validTransactions.map((tx) => ({
            accountId,
            description: tx.description,
            notes: tx.notes,
            amount: tx.amount,
            currency: defaultCurrency,
            date: tx.date,
            categoryId: null,
          })),
        );
      }

      processedCount = validTransactions.length;

      await this.sendNotificationEmail(
        userId,
        processedCount,
        failedCount,
        errorMessage,
      );
      await this.sendNotificationToUser(userId, errorMessage);
    } catch (error) {
      this.logger.error(
        `Error in OFE import job ${job.id} for user ${userId}`,
        error,
      );
      errorMessage = error instanceof Error ? error.message : String(error);
      await this.sendNotificationEmail(userId, 0, 0, errorMessage);
      await this.sendNotificationToUser(userId, errorMessage);
      throw error;
    }

    return { processed: processedCount, failed: failedCount };
  }

  private parseOfeTransactions(ofeContent: string): ParsedOfeTransaction[] {
    const statementRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    const matches = ofeContent.matchAll(statementRegex);

    const transactions: ParsedOfeTransaction[] = [];
    for (const match of matches) {
      const block = match[1];
      const dateRaw = this.extractTag(block, 'DTPOSTED');
      const amountRaw = this.extractTag(block, 'TRNAMT');
      const name = this.extractTag(block, 'NAME');
      const memo = this.extractTag(block, 'MEMO');
      const trnType = this.extractTag(block, 'TRNTYPE');

      const description = name || memo || trnType || 'Imported transaction';
      const notes = memo || '';
      const amount = Number.parseFloat(amountRaw ?? '');
      const date = this.parseOfeDate(dateRaw);

      transactions.push({
        date,
        amount,
        description,
        notes,
      });
    }

    return transactions;
  }

  private parseOfeDate(rawDate: string | null): Date {
    if (!rawDate) {
      return new Date(Number.NaN);
    }

    const normalized = rawDate.substring(0, 8);
    const year = normalized.substring(0, 4);
    const month = normalized.substring(4, 6);
    const day = normalized.substring(6, 8);
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  private extractTag(content: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i');
    const match = content.match(regex);
    return match?.[1]?.trim() ?? null;
  }

  private async resolveAccountId(
    userId: string,
    ofeContent: string,
  ): Promise<string> {
    const accountKey =
      this.extractTag(ofeContent, 'ACCTID') ??
      this.extractTag(ofeContent, 'BANKID') ??
      'OFE Imported Account';
    const accountName = `OFE ${accountKey}`;
    const accounts = await this.accountsService.findAllUserAccounts(userId);
    const existingAccount = accounts.find(
      (account) => account.name === accountName,
    );

    if (existingAccount) {
      return existingAccount.id;
    }

    const account = await this.accountsService.create({
      user_id: userId,
      dto: {
        name: accountName,
        currency: await this.getUserDefaultCurrency(userId),
        type: AccountType.CURRENT_ACCOUNT,
        source: AccountSource.IMPORTED,
        source_name: 'OFE Import - API',
      },
    });

    return account.id;
  }

  private async getUserDefaultCurrency(userId: string): Promise<string> {
    const user = await this.usersService.findUserData(userId);
    return user?.default_currency || DEFAULT_CURRENCY;
  }

  private async sendNotificationEmail(
    userId: string,
    processedCount: number,
    failedCount: number,
    errorMessage: string | null,
  ): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
      return;
    }

    if (errorMessage) {
      await this.emailService.sendImportErrorEmail({
        to: user.email,
        userName: user.name || 'User',
        errorMessage,
      });
      return;
    }

    await this.emailService.sendImportCompletionEmail({
      to: user.email,
      userName: user.name || 'User',
      processedCount,
      failedCount,
    });
  }

  private async sendNotificationToUser(
    userId: string,
    errorMessage: string | null,
  ): Promise<void> {
    await this.notificationsService.createSystemNotification({
      userId,
      message: errorMessage
        ? 'Import data finished with error'
        : 'Import data finished successfully',
      icon: errorMessage ? '⚠️' : '🔔',
      type: errorMessage ? NotificationType.IMPORTANT : NotificationType.INFO,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<OfeImportJobData>) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OfeImportJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
