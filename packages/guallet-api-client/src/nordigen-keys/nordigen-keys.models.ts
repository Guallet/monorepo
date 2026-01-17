export interface NordigenKey {
  id: string;
  name: string;
  secret_id_masked: string;
  account_ids: string[];
  last_sync_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
}

export interface CreateNordigenKeyRequest {
  name: string;
  secret_id: string;
  secret_key: string;
  account_ids?: string[];
}

export interface UpdateNordigenKeyRequest {
  name?: string;
  secret_id?: string;
  secret_key?: string;
}

export interface LinkAccountsRequest {
  account_ids: string[];
}
