import { ApiProperty } from '@nestjs/swagger';
import { RecurrenceCadence } from '../entities/recurring-payment.entity';

export class DetectedRecurringPaymentDto {
  @ApiProperty()
  description: string;

  @ApiProperty()
  averageAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: RecurrenceCadence })
  suggestedCadence: RecurrenceCadence;

  @ApiProperty()
  nextExpectedDate: Date;

  @ApiProperty({ description: 'Confidence score between 0 and 1' })
  confidenceScore: number;

  @ApiProperty({ description: 'Number of occurrences found' })
  occurrenceCount: number;

  @ApiProperty({ description: 'List of transaction IDs that match this pattern' })
  transactionIds: string[];

  @ApiProperty({ required: false })
  categoryId?: string;

  @ApiProperty({ required: false })
  category?: {
    id: string;
    name: string;
    icon?: string;
    colour?: string;
  };
}
