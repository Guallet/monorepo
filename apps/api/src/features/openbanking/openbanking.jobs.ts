export const OPENBANKING_QUEUE = 'openbanking';
export type BankJobOperation = 'refresh' | 'import' | 'sync';
export type BankJobData = {
  userId: string;
  connectionId: string;
  credentialVersion: number;
  operation: BankJobOperation;
  accountIds?: string[];
};
