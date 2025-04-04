import { fetch_delete, get, getRawResponse, post } from "@/api/fetchHelper";
import { InstitutionDto as GualletInstitutionDto } from "@/features/institutions/api/institutions.api";

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

export async function loadConnections(): Promise<ObConnection[]> {
  return await get<ObConnection[]>("openbanking/connections");
}

export async function loadConnection(id: string): Promise<ObConnection> {
  return await get<ObConnection>(`openbanking/connections/${id}`);
}

export type CountryDto = {
  code: string;
  name: string;
};

export async function getSupportedCountries(): Promise<CountryDto[]> {
  return await get<CountryDto[]>("openbanking/countries");
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
  return await get<InstitutionDto[]>(`openbanking/${countryCode}/institutions`);
}

export async function getInstitution(
  instituionId: string
): Promise<GualletInstitutionDto> {
  return await get<GualletInstitutionDto>(
    `openbanking/institutions/${instituionId}/`
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

export async function getObAccountsForConnection(
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

export async function syncAccountData(account_id: string) {
  return await getRawResponse(`openbanking/connections/${account_id}/sync`);
}

export async function deleteConnection(connection_id: string) {
  return await fetch_delete(`openbanking/connections/${connection_id}`);
}
