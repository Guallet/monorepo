export type BankSyncBank = {
  id: string;
  name: string;
  connectionStatus?: {
    connected?: boolean;
    status?: string;
    errorCode?: string;
  };
};

export type BankSyncRemoteAccount = {
  id?: string;
  accountId?: string;
  name?: string;
  accountName?: string;
  type?: string;
  currency?: string;
  balance?: number | string | null;
  currentBalance?: number | string | null;
};

export type BankSyncRemoteTransaction = {
  id: string;
  date: string;
  amount: number | string;
  currency?: string | null;
  description?: string | null;
  name?: string | null;
  merchant?: string | null;
  pending?: boolean;
  pendingTransactionId?: string | null;
};

export type BankSyncResponse<T> = {
  success: boolean;
  data: T;
  modified?: T;
  removed?: string[];
  meta?: { cursor?: string | null; hasMore?: boolean };
};

export type BankSyncRemoteBalance = {
  balance?: number | string;
  currentBalance?: number | string;
  amount?: number | string;
  currency?: string;
};
