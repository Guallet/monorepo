import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Institution {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  image_src?: string;
}
