import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateAccountRequest } from './create-account-request.dto';

export class UpdateAccountRequest extends OmitType(CreateAccountRequest, [
  'initial_balance',
  'source',
  'source_name',
] as const) {
  @ApiProperty({
    description: 'The new balance of the account',
    nullable: true,
  })
  balance?: number;
}
