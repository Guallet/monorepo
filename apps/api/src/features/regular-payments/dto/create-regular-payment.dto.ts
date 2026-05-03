import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
} from 'class-validator';
import {
  RecurrenceCadence,
  RecurringPaymentType,
} from '../entities/regular-payment.entity';

export class CreateRegularPaymentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsISO4217CurrencyCode()
  currency: string;

  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string' && value.trim().length === 0) {
      return undefined;
    }

    return value;
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ enum: RecurrenceCadence })
  @IsEnum(RecurrenceCadence)
  @IsNotEmpty()
  cadence: RecurrenceCadence;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ enum: RecurringPaymentType })
  @IsEnum(RecurringPaymentType)
  @IsNotEmpty()
  type: RecurringPaymentType;
}
