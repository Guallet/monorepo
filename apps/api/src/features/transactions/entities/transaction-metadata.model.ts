import { NordigenTransactionDto } from 'src/features/nordigen/dto/nordigen-transaction.dto';

export interface LunchFlowTransactionData {
  id: string | number;
  amount: number;
  currency: string;
  date: string;
  merchant?: string | null;
  description?: string | null;
  isPending?: boolean;
}

export interface TransactionMetadata {
  provider: TransactionDataProvider;
  data: NordigenTransactionDto | LunchFlowTransactionData | string | null;
}

export type TransactionDataProvider =
  | 'nordigen'
  | 'lunchflow'
  | 'moneydashboard-importer'
  | 'csv-importer';
