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

export interface BankSyncTransactionData {
  id: string;
  amount: number | string;
  currency?: string | null;
  date: string;
  merchant?: string | null;
  description?: string | null;
  name?: string | null;
  pending?: boolean;
}

export interface SynciTransactionData {
  id: string | number;
  amount: number | string;
  currency: string;
  date: string;
  merchant?: string | null;
  description?: string | null;
  isPending?: boolean;
}

export interface TransactionMetadata {
  provider: TransactionDataProvider;
  data:
    | NordigenTransactionDto
    | LunchFlowTransactionData
    | BankSyncTransactionData
    | SynciTransactionData
    | string
    | null;
}

export type TransactionDataProvider =
  | 'nordigen'
  | 'lunchflow'
  | 'banksync'
  | 'synci'
  | 'moneydashboard-importer'
  | 'csv-importer';
