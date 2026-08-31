import { Injectable } from '@nestjs/common';
import { ExportEngine, ExportEngineParams } from './export-engine.interface.js';
import { normalizeAmount } from './normalize-amount.util.js';

@Injectable()
export class CsvExportEngine implements ExportEngine {
  readonly fileExtension = '.csv';
  readonly formatLabel = 'CSV';

  generateContent(params: ExportEngineParams): string {
    const { transactions, accountsMap, categoriesMap } = params;

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
        normalizeAmount(tx.amount).toString(),
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
}
