import { NordigenTransactionDto } from '../../../features/nordigen/dto/nordigen-transaction.dto.js';

export interface TransactionMetadata {
  provider: TransactionDataProvider;
  data: NordigenTransactionDto | string | null;
}

export type TransactionDataProvider =
  | 'nordigen'
  | 'moneydashboard-importer'
  | 'csv-importer';
