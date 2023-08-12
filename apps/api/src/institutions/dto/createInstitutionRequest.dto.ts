import { Field, InputType } from '@nestjs/graphql';

// @InputType()
// export class CreateInstitutionRequest {
//   @Field({ description: 'The name of the institution' })
//   name: string;

//   @Field({ description: 'The image path for the institution', nullable: true })
//   image_src?: string;

//   constructor(args: { id: string; name: string; image_src?: string }) {
//     this.name = args.name;
//     this.image_src = args.image_src;
//   }
// }

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

// const a = new CreateInstitutionRequest({
//   name: '',
//   image_src: '',
// });

const b = new CreateInstitutionRequest({
  name: ' ',
  image_src: '',
});
