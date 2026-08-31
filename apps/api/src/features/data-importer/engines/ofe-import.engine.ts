import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AccountsService } from '../../accounts/accounts.service.js';
import { UsersService } from '../../users/users.service.js';
import { Transaction } from '../../transactions/entities/transaction.entity.js';
import { DataImportRequestDto } from '../dto/data-import-request.dto.js';
import { DEFAULT_CURRENCY } from '../constants/import-defaults.js';
import { AccountType } from '../../../features/accounts/entities/accountType.model.js';
import { AccountSource } from '../../../features/accounts/entities/accountSource.model.js';
import { ImportEngine, ImportEngineResult } from './import-engine.interface.js';

interface ParsedOfeTransaction {
  date: Date;
  amount: number;
  description: string;
  notes: string;
}

@Injectable()
export class OfeImportEngine implements ImportEngine {
  readonly formatLabel = 'OFE';

  private readonly logger = new Logger(OfeImportEngine.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly accountsService: AccountsService,
    private readonly usersService: UsersService,
  ) {}

  async execute(
    userId: string,
    dto: DataImportRequestDto,
  ): Promise<ImportEngineResult> {
    const { ofeContent } = dto;

    if (!ofeContent) {
      throw new Error('OFE import requires ofeContent');
    }

    const defaultCurrency = await this.getUserDefaultCurrency(userId);
    const accountId = await this.resolveAccountId(userId, ofeContent);
    const parsedTransactions = this.parseOfeTransactions(ofeContent);

    let failedCount = 0;
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

    return { processed: validTransactions.length, failed: failedCount };
  }

  // ── OFE parsing (extracted from OfeImportProcessor) ──────────────────

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

      transactions.push({ date, amount, description, notes });
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
    const regex = new RegExp(String.raw`<${tag}>([^<\r\n]+)`, 'i');
    const match = new RegExp(regex).exec(content);
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
}
