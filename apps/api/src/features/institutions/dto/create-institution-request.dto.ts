import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateInstitutionRequest {
  @ApiProperty({ description: 'The name of the institution' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The image path for the institution',
    nullable: true,
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  image_src?: string;

  @ApiProperty({
    description: 'The country the institution',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  country?: string;

  constructor(props: CreateInstitutionRequest) {
    Object.assign(this, props);
  }
}
