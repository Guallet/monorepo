import { PartialType } from '@nestjs/swagger';
import { CreateRegularPaymentDto } from './create-regular-payment.dto.js';

export class UpdateRegularPaymentDto extends PartialType(
  CreateRegularPaymentDto,
) {}
