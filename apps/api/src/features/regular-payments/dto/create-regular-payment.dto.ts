import { ApiProperty } from '@nestjs/swagger';
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
} from '../entities/regular-payment.entity.js';

export class CreateRegularPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ minimum: 0, exclusiveMinimum: true })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ minLength: 3, maxLength: 3 })
  @IsISO4217CurrencyCode()
  currency: string;

  @ApiProperty({ required: false, format: 'uri' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ enum: RecurrenceCadence })
  @IsEnum(RecurrenceCadence)
  @IsNotEmpty()
  cadence: RecurrenceCadence;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ enum: RecurringPaymentType })
  @IsEnum(RecurringPaymentType)
  @IsNotEmpty()
  type: RecurringPaymentType;
}
