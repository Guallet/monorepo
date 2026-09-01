import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAccountRequest } from './create-account-request.dto.js';

export class UpdateAccountRequest extends PartialType(
  OmitType(CreateAccountRequest, [
    'initial_balance',
    'source',
    'source_name',
  ] as const),
) {
  @ApiProperty({
    required: false,
    description: 'The new balance of the account',
    nullable: true,
  })
  balance?: number;

  @ApiProperty({
    required: false,
    description:
      'If true, creates a new transaction to reflect the balance change',
    default: false,
  })
  create_balance_transaction?: boolean;
}
