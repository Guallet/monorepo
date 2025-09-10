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
};

export type ObConnection = {
  id: string;
  created: string;
  redirect: string;
  status: string;
  institution_id: string;
  agreement: string;
  reference: string;
  user_id: string;
  accounts: string[];
  user_language: string | null;
  link: string;
  ssn: string | null;
  account_selection: boolean;
  redirect_immediate: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type GualletInstitutionDto = {
  id: string;
  name: string;
  image_src: string;
  user_id: string | null;
  nordigen_id: string;
  countries: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
  status: "DISCOVERED" | "PROCESSING" | "READY" | "ERROR" | "SUSPENDED";
  owner_name: string;
};

export type ConnectObAccountsRequest = {
  /**
   * The IDs of the open banking accounts to be connected to
   */
  account_ids: string[];
};
