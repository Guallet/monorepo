import { User } from '../entities/user.entity.js';
import { ApiProperty } from '@nestjs/swagger';

/** Allowed date format values for user settings */
export const ALLOWED_DATE_FORMATS = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY/MM/DD',
] as const;

export class UserCurrenciesRequest {
  @ApiProperty({ required: false, description: 'The default currency code' })
  default_currency?: string;

  @ApiProperty({
    required: false,
    description: 'Preferred currency codes',
    type: [String],
  })
  preferred_currencies?: string[];
}

export class UserSettingsRequest {
  @ApiProperty({ required: false, type: () => UserCurrenciesRequest })
  currencies?: UserCurrenciesRequest;

  @ApiProperty({ required: false, enum: ALLOWED_DATE_FORMATS })
  date_format?: string;
}

export class UserCurrenciesDto {
  @ApiProperty({ nullable: true })
  default_currency: string | null;

  @ApiProperty({ type: [String] })
  preferred_currencies: string[];
}

export class UserSettingsDto {
  @ApiProperty({ type: () => UserCurrenciesDto })
  currencies: UserCurrenciesDto;
  @ApiProperty({ required: false, nullable: true, enum: ALLOWED_DATE_FORMATS })
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
