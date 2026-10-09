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
} from '../entities/regular-payment.entity';

export class CreateRegularPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsISO4217CurrencyCode()
  currency: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ enum: RecurrenceCadence })
  @IsEnum(RecurrenceCadence)
  @IsNotEmpty()
  cadence: RecurrenceCadence;

  @ApiProperty({
    description: 'The start date as an ISO 8601 date or date-time string',
    required: false,
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiProperty({ enum: RecurringPaymentType })
  @IsEnum(RecurringPaymentType)
  @IsNotEmpty()
  type: RecurringPaymentType;
}
