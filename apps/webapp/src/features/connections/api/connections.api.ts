import { get, post } from "../../../core/api/fetchHelper";

export type ObConnection = {
  id: string;
  created: string;
  redirect: string;
  status: string;
  institution_id: string;
  agreement: string;
  reference: string;
  user_id: string;
  accounts: any[]; //TODO: Replace 'any' with the actual type of the accounts if known
  user_language: string | null;
  link: string;
  ssn: string | null;
  account_selection: boolean;
  redirect_immediate: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export async function loadConnections(): Promise<ObConnection[]> {
  return await get<ObConnection[]>("openbanking/connections");
}

export type CountryDto = {
  code: string;
  name: string;
};

export async function getSupportedCountries(): Promise<CountryDto[]> {
  return await get<CountryDto[]>("openbanking/connections/countries");
}

export type InstitutionDto = {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
};

export async function getInstitutions(
  countryCode: string
): Promise<InstitutionDto[]> {
  return await get<InstitutionDto[]>(
    `openbanking/connections/${countryCode}/institutions`
  );
}

export async function getInstitution(
  instituionId: string
): Promise<InstitutionDto> {
  return await get<InstitutionDto>(
    `openbanking/connections/institutions/${instituionId}/`
  );
}

export type ObConnectionRequest = {
  institution_id: string;
  redirect_to: string;
};
export type ObRConnectionPermissionDto = {
  link: string;
};
export async function createConnection(
  institutionId: string
): Promise<ObRConnectionPermissionDto> {
  return await post<ObRConnectionPermissionDto, ObConnectionRequest>(
    "openbanking/connections",
    {
      institution_id: institutionId,
      redirect_to: `${window.location.origin}/connections/connect/callback`,
    }
  );
}

export type ObAccountDto = {
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

export async function getObAccounts(
  requisitionId: string
): Promise<ObAccountDto[]> {
  return await get<ObAccountDto[]>(
    `openbanking/connections/${requisitionId}/accounts`
  );
}

export type ConnectAccountsRequest = {
  /**
   * The IDs of the open banking accounts to be connected to
   */
  account_ids: string[];
};

export async function linkObAccounts(accounts: string[]) {
  return await post<ObAccountDto[], ConnectAccountsRequest>(
    `openbanking/connections/connect`,
    {
      account_ids: accounts,
    }
  );
}
