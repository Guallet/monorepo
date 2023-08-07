import { InputType, Int, Field } from "@nestjs/graphql";

@InputType()
export class CreateInstitutionInput {
  @Field({ desciption: "The name of the institution" })
  name: string;

  @Field({ desciption: "The image path for the insitution", nullable: true })
  image_src?: string;
}
