import { ApiProperty } from '@nestjs/swagger';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  RegularPayment,
} from '../entities/regular-payment.entity.js';

export class RegularPaymentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: RecurringPaymentType })
  type: RecurringPaymentType;

  @ApiProperty()
  name: string;
  @ApiProperty()
  amount: number;
  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: RecurrenceCadence })
  cadence: RecurrenceCadence;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
    nullable: true,
  })
  startDate?: Date;

  @ApiProperty({ required: false })
  imageUrl?: string;
  @ApiProperty({ required: false, format: 'uuid' })
  categoryId?: string;

  static fromDomain(entity: RegularPayment): RegularPaymentDto {
    const dto = new RegularPaymentDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.name = entity.name;
    dto.amount = entity.amount;
    dto.currency = entity.currency;
    dto.cadence = entity.cadence;
    dto.startDate = entity.startDate;
    dto.imageUrl = entity.imageUrl;
    dto.categoryId = entity.category ? entity.category.id : undefined;
    return dto;
  }
}
