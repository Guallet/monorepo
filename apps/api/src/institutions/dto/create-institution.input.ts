import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateInstitutionInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
