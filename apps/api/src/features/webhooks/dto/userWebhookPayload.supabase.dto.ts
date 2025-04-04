export type SupabaseWebhookUserPayloadType = 'INSERT' | 'UPDATE' | 'DELETE';

export type SupabaseWebhookUserPayload = {
  type: SupabaseWebhookUserPayloadType;
  table: string;
  schema: string;
  record: SupabaseUserRecord | null;
  old_record: SupabaseUserRecord | null;
};

export type SupabaseUserRawUserMetaData = {
  iss: string;
  sub: string;
  name: string;
  email: string;
  picture: string;
  full_name: string;
  avatar_url: string;
  provider_id: string;
  email_verified: boolean;
  phone_verified: boolean;
};

export type SupabaseUserRecord = {
  id: string;
  aud: string;
  role: string;
  email: string;
  phone: string | null;
  created_at: string | null;
  deleted_at: string | null;
  invited_at: string | null;
  updated_at: string | null;
  instance_id: string | null;
  is_sso_user: boolean | null;
  banned_until: string | null;
  confirmed_at: string | null;
  email_change: string | null;
  is_anonymous: boolean | null;
  phone_change: string | null;
  is_super_admin: boolean | null;
  recovery_token: string | null;
  last_sign_in_at: string | null;
  recovery_sent_at: string | null;
  raw_app_meta_data: {
    provider: string;
    providers: string[];
  } | null;
  confirmation_token: string;
  email_confirmed_at: string | null;
  encrypted_password: string | null;
  phone_change_token: string | null;
  phone_confirmed_at: string | null;
  raw_user_meta_data: SupabaseUserRawUserMetaData | null;
  confirmation_sent_at: string | null;
  email_change_sent_at: string | null;
  phone_change_sent_at: string | null;
  email_change_token_new: string | null;
  reauthentication_token: string | null;
  reauthentication_sent_at: string | null;
  email_change_token_current: string | null;
  email_change_confirm_status: number | null;
};
