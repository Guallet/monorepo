// Better Auth webhook payload types
// These are generic types that Better Auth uses for user events

export type BetterAuthWebhookUserPayloadType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted';

export type BetterAuthWebhookUserPayload = {
  type: BetterAuthWebhookUserPayloadType;
  data: BetterAuthUserRecord;
};

export type BetterAuthUserRecord = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
