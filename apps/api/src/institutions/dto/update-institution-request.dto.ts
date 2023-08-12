import { CreateInstitutionRequest } from './create-institution-request.dto';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateInstitutionRequest extends PartialType(
  CreateInstitutionRequest,
) {
  //   @Field((type) => ID)
  //   id: string;
  //   constructor(props: UpdateInstitutionRequest) {
  //     super({
  //       id: props.id,
  //       name: props.name,
  //     });
  //     this.id = props.id;
  //   }
}
