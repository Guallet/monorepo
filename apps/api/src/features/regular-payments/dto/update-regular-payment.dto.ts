import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  RecurrenceCadence,
  RecurringPaymentType,
} from '../entities/regular-payment.entity';

export class UpdateRegularPaymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO4217CurrencyCode()
  currency?: string;

  @ApiProperty({ required: false, format: 'uri' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    required: false,
    type: String,
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiProperty({ required: false, enum: RecurrenceCadence })
  @IsOptional()
  @IsEnum(RecurrenceCadence)
  cadence?: RecurrenceCadence;

  @ApiProperty({
    description: 'The start date as an ISO 8601 date or date-time string',
    required: false,
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiProperty({ required: false, enum: RecurringPaymentType })
  @IsOptional()
  @IsEnum(RecurringPaymentType)
  type?: RecurringPaymentType;
}
