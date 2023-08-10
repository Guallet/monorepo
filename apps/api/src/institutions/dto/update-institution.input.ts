import { CreateInstitutionInput } from './create-institution.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateInstitutionInput extends PartialType(
  CreateInstitutionInput,
) {
  @Field((type) => ID)
  id: string;
}
