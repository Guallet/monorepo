import { NordigenTransactionDto } from 'src/features/nordigen/dto/nordigen-transaction.dto';

export interface TransactionMetadata {
  provider: TransactionDataProvider;
  data: NordigenTransactionDto | string | null;
}

export type TransactionDataProvider =
  | 'nordigen'
  | 'moneydashboard-importer'
  | 'csv-importer';
