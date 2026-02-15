import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import {
  CsvImportRequestDto,
  AccountMapping,
  CategoryMapping,
  CsvRowData,
  FieldMappings,
} from '../dto/csv-import-request.dto';
import {
  DEFAULT_CURRENCY,
  DEFAULT_ACCOUNT_TYPE,
  DEFAULT_ACCOUNT_SOURCE,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_CATEGORY_COLOR,
} from '../constants/import-defaults';
import { parseNumber } from '../utils/number.utils';
import { parseDate } from '../utils/date.utils';
import { AccountSource } from 'src/features/accounts/entities/accountSource.model';

export const CSV_IMPORT_QUEUE = 'csv-import';
export const CSV_IMPORT_JOB = 'process-csv-import';

const BATCH_SIZE = 150;

export interface CsvImportJobData {
  userId: string;
  dto: CsvImportRequestDto;
}

interface PreparedTransaction {
  accountId: string;
  description: string;
  notes: string | undefined;
  amount: number;
  currency: string;
  date: Date;
  categoryId: string | null;
}

interface ValidationResult {
  preparedTransactions: PreparedTransaction[];
  failedCount: number;
}

@Processor(CSV_IMPORT_QUEUE)
export class CsvImportProcessor extends WorkerHost {
  private readonly logger = new Logger(CsvImportProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(
    job: Job<CsvImportJobData>,
  ): Promise<{ processed: number; failed: number }> {
    const { userId, dto } = job.data;
    void job.log(`Processing CSV import job ${job.id} for user ${userId}`);

    let processedCount = 0;
    let failedCount = 0;
    let errorMessage: string | null = null;

    try {
      const { csvData, fieldMappings, accountMappings, categoryMappings } = dto;
      void job.log('CSV data rows:');
      const defaultCurrency = await this.getUserDefaultCurrency(userId);

      // Step 1: Create accounts that need to be created (outside transaction)
      void job.log(
        'Creating accounts with mappings:' +
          JSON.stringify({
            userId,
            accountMappings,
            defaultCurrency,
          }),
      );
      const accountIdMap = await this.createAccounts(
        userId,
        accountMappings,
        defaultCurrency,
      );
      void job.log(
        'Account ID map:' +
          JSON.stringify({
            userId,
            accountIdMap: Object.fromEntries(accountIdMap),
          }),
      );

      // Step 2: Create categories that need to be created (outside transaction)
      void job.log(
        'Creating categories with mappings:' +
          JSON.stringify({
            userId,
            categoryMappings,
          }),
      );
      const categoryIdMap = await this.createCategories(
        userId,
        categoryMappings,
      );
      void job.log(
        'Category ID map:' +
          JSON.stringify({
            userId,
            categoryIdMap: Object.fromEntries(categoryIdMap),
          }),
      );

      // Step 3: Prepare and validate all transactions
      void job.log('Validating and preparing transactions:');
      const validationResult = await this.validateAndPrepareTransactions(
        // csvData,
        csvData.slice(0, 5), // Log only first 5 rows for brevity
        fieldMappings,
        accountIdMap,
        categoryIdMap,
        defaultCurrency,
      );

      failedCount = validationResult.failedCount;
      const { preparedTransactions } = validationResult;

      // Sort by date descending (newer first)
      preparedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Step 4: Insert in batches within a single SQL transaction
      const insertResult = await this.insertTransactionsInBatches(
        job,
        preparedTransactions,
      );

      processedCount = insertResult.processedCount;
      if (insertResult.errorMessage) {
        errorMessage = insertResult.errorMessage;
        failedCount = preparedTransactions.length + failedCount;
      }

      // Step 5: Send email notification
      await this.sendNotificationEmail(
        userId,
        processedCount,
        failedCount,
        errorMessage,
      );

      await this.sendNotificationToUser(
        userId,
        processedCount,
        failedCount,
        errorMessage,
      );
    } catch (error) {
      this.logger.error(
        `Error in CSV import job ${job.id} for user ${userId}`,
        error,
      );
      errorMessage = error instanceof Error ? error.message : String(error);

      // Send error notification
      await this.sendNotificationEmail(userId, 0, 0, errorMessage);
      await this.sendNotificationToUser(userId, 0, 0, errorMessage);

      throw error; // Re-throw to mark job as failed
    }

    return { processed: processedCount, failed: failedCount };
  }

  private async validateAndPrepareTransactions(
    csvData: CsvRowData[],
    fieldMappings: FieldMappings,
    accountIdMap: Map<string, string>,
    categoryIdMap: Map<string, string>,
    defaultCurrency: string,
  ): Promise<ValidationResult> {
    const preparedTransactions: PreparedTransaction[] = [];
    let failedCount = 0;

    for (const row of csvData) {
      const result = await this.processRow(
        row,
        fieldMappings,
        accountIdMap,
        categoryIdMap,
        defaultCurrency,
      );

      if (result) {
        preparedTransactions.push(result);
      } else {
        failedCount++;
      }
    }

    return { preparedTransactions, failedCount };
  }

  private async processRow(
    row: CsvRowData,
    fieldMappings: FieldMappings,
    accountIdMap: Map<string, string>,
    categoryIdMap: Map<string, string>,
    defaultCurrency: string,
  ): Promise<PreparedTransaction | null> {
    const accountKey = (row[fieldMappings.account] as string) || 'default';
    const categoryKey = row[fieldMappings.category] as string | undefined;

    const accountId = accountIdMap.get(accountKey);
    const categoryId = categoryKey ? categoryIdMap.get(categoryKey) : undefined;

    if (!accountId) {
      this.logger.warn(
        `No account found for key: ${accountKey}. Mappings: ${JSON.stringify({
          accountIdMap: Object.fromEntries(accountIdMap),
          accountKey,
        })}`,
      );
      return null;
    }

    // Validate and parse date
    const dateValue = row[fieldMappings.date] as string;
    const parsedDate = parseDate(dateValue);
    if (!parsedDate) {
      this.logger.error(`Invalid date: ${dateValue}`);
      return null;
    }

    // Validate and parse amount
    const amountValue = row[fieldMappings.amount] as string;
    const parsedAmount = parseNumber(amountValue);
    if (Number.isNaN(parsedAmount)) {
      this.logger.error(`Invalid amount: ${amountValue}`);
      return null;
    }

    // Get account currency
    const account = await this.accountsService.findOneById(accountId);

    return {
      accountId,
      description: (row[fieldMappings.description] as string) || '',
      notes: (row[fieldMappings.notes] as string) || undefined,
      amount: parsedAmount,
      currency: account?.currency || defaultCurrency,
      date: parsedDate,
      categoryId: categoryId || null,
    };
  }

  private async insertTransactionsInBatches(
    job: Job<CsvImportJobData>,
    preparedTransactions: PreparedTransaction[],
  ): Promise<{ processedCount: number; errorMessage: string | null }> {
    if (preparedTransactions.length === 0) {
      return { processedCount: 0, errorMessage: null };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let processedCount = 0;
    let errorMessage: string | null = null;

    try {
      const transactionRepository =
        queryRunner.manager.getRepository(Transaction);

      // Process in batches of BATCH_SIZE
      for (let i = 0; i < preparedTransactions.length; i += BATCH_SIZE) {
        const batch = preparedTransactions.slice(i, i + BATCH_SIZE);
        const entities = this.createTransactionEntities(batch);

        await transactionRepository.save(entities);
        processedCount += entities.length;

        // Update job progress
        const progress = Math.round(
          ((i + batch.length) / preparedTransactions.length) * 100,
        );
        await job.updateProgress(progress);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `CSV import job ${job.id} committed. Processed: ${processedCount}`,
      );
    } catch (insertError) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error inserting transactions for job ${job.id}, rolling back`,
        insertError,
      );
      errorMessage =
        insertError instanceof Error
          ? insertError.message
          : String(insertError);
      processedCount = 0;
    } finally {
      await queryRunner.release();
    }

    return { processedCount, errorMessage };
  }

  private createTransactionEntities(
    batch: PreparedTransaction[],
  ): Transaction[] {
    return batch.map((txData) => {
      const entity = new Transaction();
      entity.accountId = txData.accountId;
      entity.description = txData.description;
      entity.notes = txData.notes ?? '';
      entity.amount = txData.amount;
      entity.currency = txData.currency;
      entity.date = txData.date;
      entity.categoryId = txData.categoryId;
      return entity;
    });
  }

  private async createAccounts(
    userId: string,
    accountMappings: Record<string, AccountMapping>,
    defaultCurrency: string,
  ): Promise<Map<string, string>> {
    const accountIdMap = new Map<string, string>();

    for (const [key, mapping] of Object.entries(accountMappings)) {
      if (mapping.id) {
        accountIdMap.set(key, mapping.id);
      } else if (mapping.shouldCreate) {
        try {
          const account = await this.accountsService.create({
            user_id: userId,
            dto: {
              name: mapping.name,
              currency: defaultCurrency,
              type: DEFAULT_ACCOUNT_TYPE,
              source: AccountSource.IMPORTED,
              source_name: `CSV Import - Webapp`,
            },
          });
          accountIdMap.set(key, account.id);
          this.logger.log(`Created account: ${mapping.name} (${account.id})`);
        } catch (error) {
          this.logger.error(`Error creating account ${mapping.name}`, error);
          // Stop the execution here since accounts are essential for processing transactions
          throw error;
        }
      } else {
        throw new Error(
          `Account mapping for key "${key}" is missing an ID and shouldCreate is false`,
        );
      }
    }

    return accountIdMap;
  }

  private async getUserDefaultCurrency(userId: string): Promise<string> {
    try {
      const user = await this.usersService.findUserData(userId);
      if (user?.default_currency) {
        return user.default_currency;
      }
    } catch (error) {
      this.logger.error(
        `Could not resolve user default currency for ${userId}, using GBP as fallback`,
        error,
      );
    }

    return DEFAULT_CURRENCY;
  }

  private async createCategories(
    userId: string,
    categoryMappings: Record<string, CategoryMapping>,
  ): Promise<Map<string, string>> {
    const categoryIdMap = new Map<string, string>();

    for (const [key, mapping] of Object.entries(categoryMappings)) {
      if (mapping.id) {
        categoryIdMap.set(key, mapping.id);
      } else if (mapping.shouldCreate) {
        try {
          const category = await this.categoriesService.create({
            user_id: userId,
            dto: {
              name: mapping.name,
              icon: DEFAULT_CATEGORY_ICON,
              colour: DEFAULT_CATEGORY_COLOR,
              parentId: null,
            },
          });
          categoryIdMap.set(key, category.id);
          this.logger.log(`Created category: ${mapping.name} (${category.id})`);
        } catch (error) {
          this.logger.error(`Error creating category ${mapping.name}`, error);
        }
      }
    }

    return categoryIdMap;
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
        this.logger.warn(`Cannot send email - user ${userId} has no email`);
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
      this.logger.error(`Failed to send notification email`, error);
    }
  }

  private async sendNotificationToUser(
    userId: string,
    processedCount: number,
    failedCount: number,
    errorMessage: string | null,
  ): Promise<void> {
    try {
      if (errorMessage) {
        await this.notificationsService.createSystemNotification({
          userId,
          message: 'Import data finished with error',
          icon: '⚠️',
          type: NotificationType.IMPORTANT,
        });
        return;
      }

      await this.notificationsService.createSystemNotification({
        userId,
        message: 'Import data finished successfully',
        icon: '🔔',
        type: NotificationType.INFO,
      });
    } catch (error) {
      this.logger.error('Failed to create import notification', error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<CsvImportJobData>) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<CsvImportJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
