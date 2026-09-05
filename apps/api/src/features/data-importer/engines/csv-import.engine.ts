import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity.js';
import { AccountsService } from '../../accounts/accounts.service.js';
import { CategoriesService } from '../../categories/categories.service.js';
import { UsersService } from '../../users/users.service.js';
import type {
  AccountMapping,
  CategoryMapping,
  CsvRowData,
  FieldMappings,
} from '../dto/csv-import-request.dto.js';
import { DataImportRequestDto } from '../dto/data-import-request.dto.js';
import {
  DEFAULT_CURRENCY,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_CATEGORY_COLOR,
} from '../constants/import-defaults.js';
import { parseNumber } from '../utils/number.utils.js';
import { parseDate } from '../utils/date.utils.js';
import { AccountSource } from '../../../features/accounts/entities/accountSource.model.js';
import { AccountType } from '../../../features/accounts/entities/accountType.model.js';
import { ImportEngine, ImportEngineResult } from './import-engine.interface.js';

const BATCH_SIZE = 150;

interface PreparedTransaction {
  accountId: string;
  description: string;
  notes: string | undefined;
  amount: number;
  currency: string;
  date: Date;
  categoryId: string | null;
}

@Injectable()
export class CsvImportEngine implements ImportEngine {
  readonly formatLabel = 'CSV';

  private readonly logger = new Logger(CsvImportEngine.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async execute(
    userId: string,
    dto: DataImportRequestDto,
    onProgress?: (percent: number) => Promise<void>,
  ): Promise<ImportEngineResult> {
    const { csvData, fieldMappings, accountMappings, categoryMappings } = dto;

    if (!csvData || !fieldMappings || !accountMappings) {
      throw new Error(
        'CSV import requires csvData, fieldMappings, and accountMappings',
      );
    }

    const defaultCurrency = await this.getUserDefaultCurrency(userId);

    const accountIdMap = await this.createAccounts(
      userId,
      accountMappings,
      defaultCurrency,
    );

    const categoryIdMap = await this.createCategories(
      userId,
      categoryMappings ?? {},
    );

    const validationResult = await this.validateAndPrepareTransactions(
      csvData,
      fieldMappings,
      accountIdMap,
      categoryIdMap,
      defaultCurrency,
    );

    let failedCount = validationResult.failedCount;
    const { preparedTransactions } = validationResult;

    preparedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    const insertResult = await this.insertTransactionsInBatches(
      preparedTransactions,
      onProgress,
    );

    let processedCount = insertResult.processedCount;
    if (insertResult.errorMessage) {
      failedCount = preparedTransactions.length + failedCount;
      processedCount = 0;
    }

    return { processed: processedCount, failed: failedCount };
  }

  // ── private helpers (extracted from CsvImportProcessor) ──────────────

  private async validateAndPrepareTransactions(
    csvData: CsvRowData[],
    fieldMappings: FieldMappings,
    accountIdMap: Map<string, string>,
    categoryIdMap: Map<string, string>,
    defaultCurrency: string,
  ): Promise<{
    preparedTransactions: PreparedTransaction[];
    failedCount: number;
  }> {
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
      this.logger.error(`No account found for key: ${accountKey}`);
      return null;
    }

    const dateValue = row[fieldMappings.date] as string;
    const parsedDate = parseDate(dateValue);
    if (!parsedDate) {
      this.logger.error(`Invalid date: ${dateValue}`);
      return null;
    }

    const amountValue = row[fieldMappings.amount] as string;
    const parsedAmount = parseNumber(amountValue);
    if (Number.isNaN(parsedAmount)) {
      this.logger.error(`Invalid amount: ${amountValue}`);
      return null;
    }

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
    preparedTransactions: PreparedTransaction[],
    onProgress?: (percent: number) => Promise<void>,
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

      for (let i = 0; i < preparedTransactions.length; i += BATCH_SIZE) {
        const batch = preparedTransactions.slice(i, i + BATCH_SIZE);
        const entities = batch.map((txData) => {
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

        await transactionRepository.save(entities);
        processedCount += entities.length;

        if (onProgress) {
          const progress = Math.round(
            ((i + batch.length) / preparedTransactions.length) * 100,
          );
          await onProgress(progress);
        }
      }

      await queryRunner.commitTransaction();
    } catch (insertError) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Error inserting transactions, rolling back',
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
              type: AccountType.CURRENT_ACCOUNT,
              source: AccountSource.IMPORTED,
              source_name: `CSV Import - Webapp`,
            },
          });
          accountIdMap.set(key, account.id);
        } catch (error) {
          this.logger.error(`Error creating account ${mapping.name}`, error);
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
        } catch (error) {
          this.logger.error(`Error creating category ${mapping.name}`, error);
        }
      }
    }

    return categoryIdMap;
  }

  private async getUserDefaultCurrency(userId: string): Promise<string> {
    try {
      const user = await this.usersService.findUserData(userId);
      if (user?.default_currency) {
        return user.default_currency;
      }
    } catch (error) {
      this.logger.error(
        `Could not resolve user default currency for ${userId}, using fallback`,
        error,
      );
    }
    return DEFAULT_CURRENCY;
  }
}
