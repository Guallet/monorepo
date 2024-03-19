import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAccountRequest {
  @Field({ description: 'The name of the account' })
  name: string;

  @Field({ description: 'The initial balance of the account', nullable: true })
  initial_balance?: number;

  @Field({ description: 'The account type', nullable: false })
  type: string;

  @Field({ description: 'The account origin source', nullable: true })
  source?: string;

  @Field({ description: 'The account origin source name', nullable: true })
  source_name?: string;

  @Field({ description: 'The institution id', nullable: true })
  institution_id?: string;

  @Field({
    description: 'The account currency (3 letters code)',
    nullable: false,
  })
  currency: string;

  constructor(props: CreateAccountRequest) {
    Object.assign(this, props);
  }
}
