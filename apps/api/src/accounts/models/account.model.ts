import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Account {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field((type) => Float, { description: 'Account balance' })
  balance: number;

  //   @Field((type) => [Post])
  //   posts: Post[];
}
