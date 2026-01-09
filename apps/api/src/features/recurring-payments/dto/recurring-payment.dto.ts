import { ApiProperty } from '@nestjs/swagger';
import { RecurringPayment, RecurringPaymentType, RecurrenceCadence } from '../entities/recurring-payment.entity';

export class RecurringPaymentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

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

  @ApiProperty()
  nextDate: Date;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty({ required: false })
  categoryId?: string;

  @ApiProperty({ required: false })
  category?: {
    id: string;
    name: string;
    icon?: string;
    colour?: string;
  };

  @ApiProperty({ required: false })
  metadata?: {
    confidenceScore?: number;
    detectedFromTransactionId?: string;
    averageAmount?: number;
    lastOccurrence?: Date;
  };

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromDomain(entity: RecurringPayment): RecurringPaymentDto {
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type,
      name: entity.name,
      amount: Number(entity.amount),
      currency: entity.currency,
      cadence: entity.cadence,
      nextDate: entity.nextDate,
      imageUrl: entity.imageUrl,
      categoryId: entity.categoryId,
      category: entity.category ? {
        id: entity.category.id,
        name: entity.category.name,
        icon: entity.category.icon,
        colour: entity.category.colour,
      } : undefined,
      metadata: entity.metadata,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}
