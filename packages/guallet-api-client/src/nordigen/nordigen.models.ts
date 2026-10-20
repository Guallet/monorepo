export type NordigenCredentialStatusDto = {
  configured: boolean;
  credentialHint: string | null;
};

export type SaveNordigenCredentialsRequest = {
  secretId: string;
  secretKey: string;
};
