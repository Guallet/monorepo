import { CreateInstitutionInput } from './create-institution.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateInstitutionInput extends PartialType(CreateInstitutionInput) {
  @Field(() => Int)
  id: number;
}
