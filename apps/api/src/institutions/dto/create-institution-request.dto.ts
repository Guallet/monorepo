import { ApiProperty } from '@nestjs/swagger';

export class CreateInstitutionRequest {
  @ApiProperty({ description: 'The name of the institution' })
  name: string;

  @ApiProperty({
    description: 'The image path for the institution',
    nullable: true,
  })
  image_src?: string;

  constructor(props: CreateInstitutionRequest) {
    Object.assign(this, props);
  }
}
