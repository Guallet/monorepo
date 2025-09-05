import { User } from '../entities/user.entity';

/** Allowed date format values for user settings */
export const ALLOWED_DATE_FORMATS = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY/MM/DD',
] as const;

export class UserSettingsRequest {
  currencies?: {
    default_currency?: string;
    preferred_currencies?: string[];
  };
  date_format?: string;
}

export class UserSettingsDto {
  currencies: {
    default_currency: string | null;
    preferred_currencies: string[];
  };
  date_format?: string | null;

  static fromDomain(domain: User): UserSettingsDto {
    return {
      currencies: {
        default_currency: domain.default_currency,
        preferred_currencies: domain.preferred_currencies ?? [],
      },
      date_format: domain.date_format ?? null,
    };
  }
}
