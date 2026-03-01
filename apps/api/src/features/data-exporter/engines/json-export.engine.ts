import { Injectable } from '@nestjs/common';
import { ExportEngine, ExportEngineParams } from './export-engine.interface';
import { normalizeAmount } from './normalize-amount.util';

@Injectable()
export class JsonExportEngine implements ExportEngine {
  readonly fileExtension = '.json';
  readonly formatLabel = 'JSON';

  generateContent(params: ExportEngineParams): string {
    const { transactions, accountsMap, categoriesMap } = params;

    return JSON.stringify(
      transactions.map((transaction) => ({
        id: transaction.id,
        date: transaction.date.toISOString(),
        account:
          accountsMap.get(transaction.accountId) || transaction.accountId,
        description: transaction.description,
        amount: normalizeAmount(transaction.amount),
        currency: transaction.currency,
        notes: transaction.notes || '',
        category: transaction.categoryId
          ? categoriesMap.get(transaction.categoryId) || ''
          : '',
      })),
      null,
      2,
    );
  }
}
