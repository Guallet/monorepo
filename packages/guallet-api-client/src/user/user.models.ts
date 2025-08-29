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
}

export type UpdateUserSettingsRequest = {
  currencies?: {
    default_currency?: string;
    preferred_currencies?: string[];
  };
};
