import { Injectable } from '@nestjs/common';
import { ExportEngine, ExportEngineParams } from './export-engine.interface';

@Injectable()
export class JsonExportEngine implements ExportEngine {
  readonly fileExtension = '.json';
  readonly formatLabel = 'JSON';

  generateContent(params: ExportEngineParams): string {
    const { transactions, accountsMap, categoriesMap } = params;

    return JSON.stringify(
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
  }
}
