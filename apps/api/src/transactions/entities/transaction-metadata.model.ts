import { NordigenTransactionDto } from 'src/nordigen/dto/nordigen-transaction.dto';

export interface TransactionMetadata {
  openBanking: {
    provider: 'nordigen';
    data: NordigenTransactionDto | null;
  } | null;
  impoter: {
    source: 'moneydashboard' | 'csv' | 'manual';
    original: string;
  } | null;
}

export type OpenBankingProvider = 'nordigen';
