export type OpenBankingCountryDto = {
  code: string;
  name: string;
};

export type ObInstitutionDto = {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
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
