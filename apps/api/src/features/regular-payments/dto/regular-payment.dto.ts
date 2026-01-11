import { ApiProperty } from '@nestjs/swagger';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  RegularPayment,
} from '../entities/regular-payment.entity';

export class RegularPaymentDto {
  id: string;
  user_id: string;

  @ApiProperty({ enum: RecurringPaymentType })
  type: RecurringPaymentType;

  name: string;
  amount: number;
  currency: string;

  @ApiProperty({ enum: RecurrenceCadence })
  cadence: RecurrenceCadence;
  
  @ApiProperty()
  startDate: Date;
  
  imageUrl?: string;
  categoryId?: string;

  static fromDomain(entity: RegularPayment): RegularPaymentDto {
    const dto = new RegularPaymentDto();
    dto.id = entity.id;
    dto.user_id = entity.user_id;
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
