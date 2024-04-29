import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountRequest {
  @ApiProperty({ description: 'The name of the account' })
  name: string;

  @ApiProperty({
    description: 'The initial balance of the account',
    nullable: true,
  })
  initial_balance?: number;

  @ApiProperty({ description: 'The account type', nullable: false })
  type: string;

  @ApiProperty({ description: 'The account origin source', nullable: true })
  source?: string;

  @ApiProperty({
    description: 'The account origin source name',
    nullable: true,
  })
  source_name?: string;

  @ApiProperty({ description: 'The institution id', nullable: true })
  institution_id?: string;

  @ApiProperty({
    description: 'The account currency (3 letters code)',
    nullable: false,
  })
  currency: string;

  constructor(props: CreateAccountRequest) {
    Object.assign(this, props);
  }
}
