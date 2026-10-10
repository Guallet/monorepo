import type {
  InstitutionDto,
  UpdateInstitutionRequest,
} from '@guallet/api-client';

// ISO 3166-1 alpha-2 codes; names are localised through Intl rather than persisted.
const countryCodes =
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(
    ' ',
  );
let names: Intl.DisplayNames | undefined;
try {
  names = new Intl.DisplayNames(['en-GB'], { type: 'region' });
} catch {
  // Code labels remain usable when Intl.DisplayNames is unavailable.
}
export function countryName(code: string): string {
  if (!/^[a-z]{2}$/i.test(code)) return code;
  return names?.of(code.toUpperCase()) ?? code;
}
export const countryOptions = countryCodes
  .map((id) => ({ id, label: countryName(id) }))
  .sort((a, b) => a.label.localeCompare(b.label));
export function countriesLabel(countries: string[]): string {
  return countries.map(countryName).join(', ') || 'No country set';
}
export function filterInstitutions(
  institutions: InstitutionDto[],
  query: string,
  directory: boolean,
) {
  const search = query.trim().toLocaleLowerCase();
  return institutions
    .filter((institution) => {
      const shared = institution.user_id === null;
      if (shared !== directory) return false;
      const haystack = [
        institution.name,
        ...institution.countries,
        ...institution.countries.map(countryName),
      ]
        .join(' ')
        .toLocaleLowerCase();
      return haystack.includes(search);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
export function institutionInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => Array.from(part).at(0))
      .join('')
      .toUpperCase() || 'IN'
  );
}
export type InstitutionForm = {
  name: string;
  imageUrl: string;
  country: string;
};
export function validateInstitutionForm(form: InstitutionForm) {
  const errors: { name?: string; imageUrl?: string } = {};
  if (!form.name.trim()) errors.name = 'Enter an institution name.';
  if (form.imageUrl.trim()) {
    try {
      const url = new URL(form.imageUrl.trim());
      if (!['https:', 'http:'].includes(url.protocol) || !url.hostname)
        throw new Error('Invalid URL');
    } catch {
      errors.imageUrl = 'Enter a valid http or https image URL.';
    }
  }
  return errors;
}
export function institutionRequest(
  form: InstitutionForm,
): UpdateInstitutionRequest {
  const request: UpdateInstitutionRequest = {
    name: form.name.trim(),
    image_src: form.imageUrl.trim() || null,
  };
  if (form.country) request.country = form.country;
  return request;
}
