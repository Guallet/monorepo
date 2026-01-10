import { PartialType } from '@nestjs/swagger';
import { CreateRegularPaymentDto } from './create-regular-payment.dto';

export class UpdateRegularPaymentDto extends PartialType(
  CreateRegularPaymentDto,
) {}
