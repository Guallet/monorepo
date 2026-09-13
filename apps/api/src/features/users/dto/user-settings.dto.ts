import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

/** Allowed date format values for user settings */
export const ALLOWED_DATE_FORMATS = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY/MM/DD',
] as const;

export class UserCurrenciesSettingsRequestDto {
  @ApiProperty({ required: false, minLength: 3, maxLength: 3 })
  default_currency?: string;

  @ApiProperty({ required: false, type: [String] })
  preferred_currencies?: string[];
}

export class UserCurrenciesSettingsDto {
  @ApiProperty({ nullable: true, minLength: 3, maxLength: 3 })
  default_currency: string | null;

  @ApiProperty({ type: [String] })
  preferred_currencies: string[];
}

export class UserSettingsRequest {
  @ApiProperty({
    required: false,
    type: () => UserCurrenciesSettingsRequestDto,
  })
  currencies?: UserCurrenciesSettingsRequestDto;

  @ApiProperty({ required: false, enum: ALLOWED_DATE_FORMATS })
  date_format?: string;
}

export class UserSettingsDto {
  @ApiProperty({ type: () => UserCurrenciesSettingsDto })
  currencies: UserCurrenciesSettingsDto;

  @ApiProperty({ required: false, enum: ALLOWED_DATE_FORMATS, nullable: true })
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
