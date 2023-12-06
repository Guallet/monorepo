import { get } from "../../../core/api/fetchHelper";

export type ObConnection = {
  id: string;
  name: string;
  lastRefreshed: string;
};

export async function loadCategories(): Promise<ObConnection[]> {
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
