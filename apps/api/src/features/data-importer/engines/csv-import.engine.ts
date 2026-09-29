import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { AccountsService } from '../../accounts/accounts.service';
import { CategoriesService } from '../../categories/categories.service';
import { UsersService } from '../../users/users.service';
import type {
  AccountMapping,
  CategoryMapping,
  CsvRowData,
  FieldMappings,
} from '../dto/csv-import-request.dto';
import { DataImportRequestDto } from '../dto/data-import-request.dto';
import {
  DEFAULT_CURRENCY,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_CATEGORY_COLOR,
} from '../constants/import-defaults';
import { parseNumber } from '../utils/number.utils';
import { parseDate } from '../utils/date.utils';
import { AccountSource } from 'src/features/accounts/entities/accountSource.model';
import { AccountType } from 'src/features/accounts/entities/accountType.model';
import { ImportEngine, ImportEngineResult } from './import-engine.interface';

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

async function mapSequentially<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R>,
  results: R[] = [],
): Promise<R[]> {
  if (results.length >= items.length) return results;
  results.push(await mapper(items[results.length]));
  return mapSequentially(items, mapper, results);
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
    const accountIds = [...new Set(accountIdMap.values())];
    const accounts = await Promise.all(
      accountIds.map((id) => this.accountsService.findOneById(id)),
    );
    const currencies = new Map(
      accountIds.map(
        (id, index) =>
          [id, accounts[index]?.currency || defaultCurrency] as const,
      ),
    );
    const results = csvData.map((row) =>
      this.processRow(
        row,
        fieldMappings,
        accountIdMap,
        categoryIdMap,
        currencies,
      ),
    );
    return {
      preparedTransactions: results.filter(
        (result): result is PreparedTransaction => result !== null,
      ),
      failedCount: results.filter((result) => result === null).length,
    };
  }

  private processRow(
    row: CsvRowData,
    fieldMappings: FieldMappings,
    accountIdMap: Map<string, string>,
    categoryIdMap: Map<string, string>,
    currencies: Map<string, string>,
  ): PreparedTransaction | null {
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

    return {
      accountId,
      description: (row[fieldMappings.description] as string) || '',
      notes: (row[fieldMappings.notes] as string) || undefined,
      amount: parsedAmount,
      currency: currencies.get(accountId)!,
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

      const saveBatch = async (start: number): Promise<void> => {
        if (start >= preparedTransactions.length) return;
        const batch = preparedTransactions.slice(start, start + BATCH_SIZE);
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
            ((start + batch.length) / preparedTransactions.length) * 100,
          );
          await onProgress(progress);
        }
        await saveBatch(start + BATCH_SIZE);
      };

      await saveBatch(0);

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
    const entries = await mapSequentially(
      Object.entries(accountMappings),
      async ([key, mapping]): Promise<readonly [string, string]> => {
        if (mapping.id) return [key, mapping.id];
        if (!mapping.shouldCreate) {
          throw new Error(
            `Account mapping for key "${key}" is missing an ID and shouldCreate is false`,
          );
        }
        try {
          const account = await this.accountsService.create({
            user_id: userId,
            dto: {
              name: mapping.name,
              currency: defaultCurrency,
              type: AccountType.CURRENT_ACCOUNT,
              source: AccountSource.IMPORTED,
              source_name: 'CSV Import',
            },
          });
          return [key, account.id];
        } catch (error) {
          this.logger.error(`Error creating account ${mapping.name}`, error);
          throw error;
        }
      },
    );
    return new Map(entries);
  }

  private async createCategories(
    userId: string,
    categoryMappings: Record<string, CategoryMapping>,
  ): Promise<Map<string, string>> {
    const entries = await mapSequentially(
      Object.entries(categoryMappings),
      async ([key, mapping]): Promise<readonly [string, string] | null> => {
        if (mapping.id) return [key, mapping.id];
        if (!mapping.shouldCreate) return null;
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
          return [key, category.id];
        } catch (error) {
          this.logger.error(`Error creating category ${mapping.name}`, error);
          return null;
        }
      },
    );
    return new Map(
      entries.filter(
        (entry): entry is readonly [string, string] => entry !== null,
      ),
    );
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
