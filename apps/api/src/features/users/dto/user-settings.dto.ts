import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { User } from '../entities/user.entity';

/** Allowed date format values for user settings */
export const ALLOWED_DATE_FORMATS = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY/MM/DD',
] as const;

export class UserCurrenciesSettingsRequestDto {
  @ApiProperty({ required: false, minLength: 3, maxLength: 3 })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  default_currency?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(3, 3, { each: true })
  preferred_currencies?: string[];
}

export class UserCurrenciesSettingsDto {
  @ApiProperty({ type: String, nullable: true, minLength: 3, maxLength: 3 })
  default_currency: string | null;

  @ApiProperty({ type: [String] })
  preferred_currencies: string[];
}

export class UserSettingsRequest {
  @ApiProperty({
    required: false,
    type: () => UserCurrenciesSettingsRequestDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserCurrenciesSettingsRequestDto)
  currencies?: UserCurrenciesSettingsRequestDto;

  @ApiProperty({ required: false, enum: ALLOWED_DATE_FORMATS })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_DATE_FORMATS)
  date_format?: string;
}

export class UserSettingsDto {
  @ApiProperty({ type: () => UserCurrenciesSettingsDto })
  currencies: UserCurrenciesSettingsDto;

  @ApiProperty({ required: false, enum: ALLOWED_DATE_FORMATS })
  date_format?: string;

  static fromDomain(domain: User): UserSettingsDto {
    return {
      currencies: {
        default_currency: domain.default_currency,
        preferred_currencies: domain.preferred_currencies ?? [],
      },
      date_format: domain.date_format ?? undefined,
    };
  }
}
