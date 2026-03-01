import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { AccountsService } from '../../accounts/accounts.service';
import { UsersService } from '../../users/users.service';
import { DataImportRequestDto } from '../dto/data-import-request.dto';
import { DEFAULT_CURRENCY } from '../constants/import-defaults';
import { AccountType } from 'src/features/accounts/entities/accountType.model';
import { AccountSource } from 'src/features/accounts/entities/accountSource.model';
import { ImportEngine, ImportEngineResult } from './import-engine.interface';

interface JsonTransaction {
  date: string;
  amount: number | string;
  description?: string;
  notes?: string;
  account?: string;
  currency?: string;
  category?: string;
}

@Injectable()
export class JsonImportEngine implements ImportEngine {
  readonly formatLabel = 'JSON';

  private readonly logger = new Logger(JsonImportEngine.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsService: AccountsService,
    private readonly usersService: UsersService,
  ) {}

  async execute(
    userId: string,
    dto: DataImportRequestDto,
  ): Promise<ImportEngineResult> {
    const { jsonContent } = dto;

    if (!jsonContent) {
      throw new Error('JSON import requires jsonContent');
    }

    let parsed: JsonTransaction[];
    try {
      parsed = JSON.parse(jsonContent) as JsonTransaction[];
    } catch {
      throw new Error('Invalid JSON content: could not parse');
    }

    if (!Array.isArray(parsed)) {
      throw new TypeError(
        'Invalid JSON content: expected an array of transactions',
      );
    }

    const defaultCurrency = await this.getUserDefaultCurrency(userId);
    const accountId = await this.resolveDefaultAccount(userId, defaultCurrency);

    let failedCount = 0;
    const validEntities: Partial<Transaction>[] = [];

    for (const tx of parsed) {
      const date = new Date(tx.date);
      const amount =
        typeof tx.amount === 'string'
          ? Number.parseFloat(tx.amount)
          : tx.amount;

      if (Number.isNaN(date.getTime()) || !Number.isFinite(amount)) {
        failedCount++;
        continue;
      }

      validEntities.push({
        accountId,
        description: tx.description || 'Imported transaction',
        notes: tx.notes || '',
        amount,
        currency: tx.currency || defaultCurrency,
        date,
        categoryId: null,
      });
    }

    if (validEntities.length > 0) {
      const repository = this.dataSource.getRepository(Transaction);
      await repository.save(validEntities);
    }

    return { processed: validEntities.length, failed: failedCount };
  }

  private async resolveDefaultAccount(
    userId: string,
    defaultCurrency: string,
  ): Promise<string> {
    const accountName = 'JSON Imported Account';
    const accounts = await this.accountsService.findAllUserAccounts(userId);
    const existing = accounts.find((a) => a.name === accountName);

    if (existing) {
      return existing.id;
    }

    const account = await this.accountsService.create({
      user_id: userId,
      dto: {
        name: accountName,
        currency: defaultCurrency,
        type: AccountType.CURRENT_ACCOUNT,
        source: AccountSource.IMPORTED,
        source_name: 'JSON Import - API',
      },
    });

    return account.id;
  }

  private async getUserDefaultCurrency(userId: string): Promise<string> {
    const user = await this.usersService.findUserData(userId);
    return user?.default_currency || DEFAULT_CURRENCY;
  }
}
