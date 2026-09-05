export type OpenBankingCountryDto = {
  code: string;
  name: string;
};

export type ObInstitutionDto = {
  id: string;
  name: string;
  bic: string;
  countries: string[];
  logo: string;
  transaction_total_days: string;
  max_access_valid_for_days: string;
  max_access_valid_for_days_reconfirmation: string;
};

export type ObConnectionRequest = {
  institution_id: string;
  redirect_to: string;
};
export type ObRConnectionPermissionDto = {
  link: string;
  institution_id: string;
};

export type ObConnection = {
  id: string;
  created: string;
  redirect: string;
  status: string;
  institution_id: string;
  agreement: string;
  reference: string;
  accounts: string[];
  user_language: string | null;
  link: string;
  account_selection: boolean | null;
  redirect_immediate: boolean | null;
  updated_at: string;
};

export type GualletInstitutionDto = {
  id: string;
  name: string;
  image_src?: string | null;
  nordigen_id?: string | null;
};

export type ConnectObAccountsResponse = {
  accounts_count: number;
};

export type ObAccountDto = {
  id: string;
  metadata: ObAccountMetadataDto;
  details: ObAccountDetailsDto;
};

export type ObAccountDetailsDto = {
  id: string | null;
  resourceId: string | null;
  iban: string | null;
  bban: string | null;
  currency: string | null;
  ownerName: string | null;
  name: string | null;
  bic: string | null;
  status: string | null;
  // cashAccountType?: ExternalCashAccountType1Code;
  cashAccountType: string | null;
  maskedPan: string | null;
  details: string | null;
};

export type ObAccountMetadataDto = {
  id: string;
  created: Date;
  last_accessed: Date;
  iban: string;
  institution_id: string;
  status: 'DISCOVERED' | 'PROCESSING' | 'READY' | 'ERROR' | 'SUSPENDED';
  owner_name: string;
};

export type ConnectObAccountsRequest = {
  /**
   * The IDs of the open banking accounts to be connected to
   */
  account_ids: string[];
};
