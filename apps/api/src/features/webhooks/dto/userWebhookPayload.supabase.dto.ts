export type ClerkWebhookUserPayloadType = 'INSERT' | 'UPDATE' | 'DELETE';

export type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: SupabaseUserRecord;
  old_record: null;
};
export type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: SupabaseUserRecord;
  old_record: SupabaseUserRecord;
};

export type DeletePayload = {
  type: 'DELETE';
  table: string;
  schema: string;
  record: null;
  old_record: SupabaseUserRecord;
};

export type SupabaseUserRecord = {
  id: string;
};
