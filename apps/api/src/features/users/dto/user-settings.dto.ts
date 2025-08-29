import { User } from '../entities/user.entity';

export class UserSettingsRequest {
  currencies?: {
    default_currency?: string;
    preferred_currencies?: string[];
  };
}

export class UserSettingsDto {
  currencies: {
    default_currency: string | null;
    preferred_currencies: string[];
  };

  static fromDomain(domain: User): UserSettingsDto {
    return {
      currencies: {
        default_currency: domain.default_currency,
        preferred_currencies: domain.preferred_currencies ?? [],
      },
    };
  }
}
