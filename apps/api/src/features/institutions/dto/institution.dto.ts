import { ApiProperty } from '@nestjs/swagger';
import { Institution } from '../entities/institution.entity';

export class InstitutionDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ required: false })
  image_src?: string;

  static fromDomain(domain: Institution): InstitutionDto {
    return {
      id: domain.id,
      name: domain.name,
      image_src: domain.image_src,
    };
  }
}
