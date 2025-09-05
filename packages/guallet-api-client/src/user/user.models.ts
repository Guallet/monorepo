export interface User {
  name: string;
  email: string;
  profile_src: string;
}

export type CreateUserRequest = {
  name: string;
  email: string;
  profile_src: string;
};

export interface UserSettings {
  currencies: {
    default_currency: string | null;
    preferred_currencies: string[];
  };
  date_format?: DateFormat | null;
}

export type UpdateUserSettingsRequest = {
  currencies?: {
    default_currency?: string;
    preferred_currencies?: string[];
  };
  date_format?: DateFormat;
};

/** Allowed date format values */
export const ALLOWED_DATE_FORMATS = [
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY/MM/DD",
] as const;

export type DateFormat = (typeof ALLOWED_DATE_FORMATS)[number];
