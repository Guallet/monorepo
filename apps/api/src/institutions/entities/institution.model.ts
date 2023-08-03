import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Institution {
  @Field()
  id: string;

  @Field()
  name: string;
}
