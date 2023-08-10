import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateInstitutionInput {
  @Field({ description: 'The name of the institution' })
  name: string;

  @Field({ description: 'The image path for the institution', nullable: true })
  image_src?: string;
}
