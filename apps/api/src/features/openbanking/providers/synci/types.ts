import type { BankConnectionStatus } from '../../models/bank-connection-state.model';

export type SynciConnectionResource = {
  status?: string | null;
  consent_expires_at?: string | null;
  activated_at?: string | null;
  health?: { status?: string | null } | null;
};

export type SynciPage<T> = {
  data: T[];
  meta?: { last_page?: number; current_page?: number };
};

export type SynciAccountResource = {
  id: number | string;
  financial_connection_id?: number | string | null;
  financial_connection?: {
    institution?: { name?: string | null; logo?: string | null } | null;
  } | null;
  name?: string | null;
  display_name?: string | null;
  custom_name?: string | null;
  integrator?: string | null;
  currency?: string | null;
  enabled?: boolean;
  cash_balance?: { amount?: number | string; currency?: string } | null;
  balance?: { available?: number | string; cleared?: number | string } | null;
};

export type SynciRemoteAccount = {
  raw: Record<string, unknown>;
  id: string | number;
  connection_id?: string | number | null;
  name: string;
  institution_name?: string | null;
  institution_logo?: string | null;
  provider?: string | null;
  currency?: string | null;
  status?: string | null;
  connectionStatus?: BankConnectionStatus;
  connectionExpiresAt?: string | null;
  lastRefresh?: string | null;
  balance_amount: number;
  balance_currency: string;
};

export type SynciRemoteTransaction = {
  id: string | number;
  amount: number | string;
  currency: string;
  date: string;
  merchant?: string | null;
  description?: string | null;
  isPending?: boolean;
};

export type SynciTransactionResource = {
  id: number | string;
  financial_account_id: number | string;
  amount: number | string;
  currency?: string | null;
  booking_date?: string | null;
  value_date?: string | null;
  booking_datetime?: string | null;
  value_datetime?: string | null;
  booked?: boolean | null;
  description?: string | null;
  additional_information?: string | null;
  remittance_information?: {
    unstructured?: string | null;
    structured?: string | null;
  } | null;
  mapped_fields?: {
    date?: string | null;
    payee?: string | null;
    description?: string | null;
  } | null;
};
