import { Field, Float, ObjectType } from '@nestjs/graphql';
import { AccountType } from './accountType.model';
import { Institution } from 'src/institutions/models/institution.model';

@ObjectType()
export class Account {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field((type) => Float, { description: 'Account balance' })
  balance: number;

  @Field((type) => Float, { description: 'Account balance' })
  currency: string;

  @Field({ nullable: true })
  description?: string;

  @Field((type) => AccountType)
  type: AccountType;

  //   @Field((type) => [Transaction])
  //   transactions: Transaction[];

  @Field((type) => [Institution], { nullable: 'itemsAndList' })
  institution?: Institution;

  @Field()
  created_at: Date;

  @Field({ nullable: true })
  updated_at?: Date;

  @Field({ nullable: true })
  deleted_at?: Date;
}
