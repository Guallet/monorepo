import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateInstitutionRequest {
  @Field({ description: 'The name of the institution' })
  name: string;

  @Field({ description: 'The image path for the institution', nullable: true })
  image_src?: string;

  constructor(props: CreateInstitutionRequest) {
    Object.assign(this, props);
  }
}
