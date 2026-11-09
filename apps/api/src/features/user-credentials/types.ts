export type CredentialOwner = {
  userId: string;
  key: string;
};

export type StoredCredentials = {
  id: string;
  value: string;
  hint: string | null;
  version: number;
};
