import { Injectable, Logger } from '@nestjs/common';
import {
  CsvImportRequestDto,
  AccountMapping,
  CategoryMapping,
} from './dto/csv-import-request.dto';
import { CsvImportResponseDto } from './dto/csv-import-response.dto';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { TransactionsService } from '../transactions/transactions.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DataImporterService {
  private readonly logger = new Logger(DataImporterService.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly transactionsService: TransactionsService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async importCsvData(
    userId: string,
    dto: CsvImportRequestDto,
  ): Promise<CsvImportResponseDto> {
    this.logger.log(`Starting CSV import for user ${userId}`);

    let processedCount = 0;
    let failedCount = 0;

    try {
      // Process asynchronously - don't await
      this.processImportAsync(userId, dto).then(
        ({ processed, failed }) => {
          processedCount = processed;
          failedCount = failed;
        },
      );

      // Return immediately to indicate the import has started
      return {
        message:
          'CSV import started. You will receive an email when the import is complete.',
        processedCount: 0,
        failedCount: 0,
      };
    } catch (error) {
      this.logger.error(`Error starting CSV import for user ${userId}`, error);
      throw error;
    }
  }

  private async processImportAsync(
    userId: string,
    dto: CsvImportRequestDto,
  ): Promise<{ processed: number; failed: number }> {
    let processedCount = 0;
    let failedCount = 0;

    try {
      const { csvData, fieldMappings, accountMappings, categoryMappings } = dto;

      // Step 1: Create accounts that need to be created
      const accountIdMap = await this.createAccounts(userId, accountMappings);

      // Step 2: Create categories that need to be created
      const categoryIdMap = await this.createCategories(
        userId,
        categoryMappings,
      );

      // Step 3: Create transactions
      for (const row of csvData) {
        try {
          const accountKey = row[fieldMappings.account] || 'default';
          const categoryKey = row[fieldMappings.category];

          const accountId = accountIdMap.get(accountKey);
          const categoryId = categoryKey
            ? categoryIdMap.get(categoryKey)
            : undefined;

          if (!accountId) {
            this.logger.warn(
              `Skipping transaction - no account found for key: ${accountKey}`,
            );
            failedCount++;
            continue;
          }

          await this.transactionsService.create({
            userId,
            dto: {
              accountId,
              date: new Date(row[fieldMappings.date]),
              amount: parseFloat(row[fieldMappings.amount]),
              description: row[fieldMappings.description] || '',
              notes: row[fieldMappings.notes] || undefined,
              categoryId: categoryId || undefined,
            },
          });

          processedCount++;
        } catch (error) {
          this.logger.error(`Error processing transaction:`, error);
          failedCount++;
        }
      }

      // Step 4: Send completion email
      const user = await this.usersService.findUserData(userId);
      if (user && user.email) {
        await this.emailService.sendImportCompletionEmail({
          to: user.email,
          userName: user.name || 'User',
          processedCount,
          failedCount,
        });
      }

      this.logger.log(
        `CSV import completed for user ${userId}. Processed: ${processedCount}, Failed: ${failedCount}`,
      );
    } catch (error) {
      this.logger.error(`Error in async CSV import for user ${userId}`, error);
    }

    return { processed: processedCount, failed: failedCount };
  }

  private async createAccounts(
    userId: string,
    accountMappings: Record<string, AccountMapping>,
  ): Promise<Map<string, string>> {
    const accountIdMap = new Map<string, string>();

    for (const [key, mapping] of Object.entries(accountMappings)) {
      if (mapping.id) {
        // Account already exists, use the existing ID
        accountIdMap.set(key, mapping.id);
      } else if (mapping.shouldCreate) {
        // Create new account
        try {
          const account = await this.accountsService.create({
            user_id: userId,
            dto: {
              name: mapping.name,
              currency: 'GBP',
              type: 'CURRENT',
              source: 'CSV_IMPORT',
            },
          });
          accountIdMap.set(key, account.id);
          this.logger.log(`Created account: ${mapping.name} (${account.id})`);
        } catch (error) {
          this.logger.error(`Error creating account ${mapping.name}`, error);
        }
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
        // Category already exists, use the existing ID
        categoryIdMap.set(key, mapping.id);
      } else if (mapping.shouldCreate) {
        // Create new category
        try {
          const category = await this.categoriesService.create({
            user_id: userId,
            dto: {
              name: mapping.name,
              icon: 'tag',
              colour: '#999999',
              parentId: null,
            },
          });
          categoryIdMap.set(key, category.id);
          this.logger.log(
            `Created category: ${mapping.name} (${category.id})`,
          );
        } catch (error) {
          this.logger.error(`Error creating category ${mapping.name}`, error);
        }
      }
    }

    return categoryIdMap;
  }
}
