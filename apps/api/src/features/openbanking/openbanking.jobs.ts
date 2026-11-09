export const OPENBANKING_QUEUE = 'openbanking';

export type BankJobOperation = 'refresh' | 'import' | 'sync';

export type BankJobData = {
  userId: string;
  connectionId: string;
  credentialId: string;
  credentialVersion: number;
  operation: BankJobOperation;
  accountIds?: string[];
  notifyOnNewTransactions?: boolean;
};

export type BankJobAccepted = {
  jobId: string;
};

export type BankJobResult = {
  accountsDiscovered?: number;
  accountIds?: string[];
  accountsSynced?: number;
  errors?: string[];
};

export type BankJobStatus = {
  status: 'queued' | 'running' | 'completed' | 'failed';
  operation: BankJobOperation;
  result?: BankJobResult;
  error?: string;
};
