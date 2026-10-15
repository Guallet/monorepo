import { ApiProperty } from '@nestjs/swagger';
import { Institution } from '../entities/institution.entity';

export class InstitutionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ required: false, nullable: true, type: String, format: 'uri' })
  image_src?: string | null;
  @ApiProperty({ required: false, nullable: true, type: String })
  nordigen_id?: string | null;
  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  user_id: string | null;
  @ApiProperty({ type: [String] })
  countries: string[];

  static fromDomain(domain: Institution): InstitutionDto {
    return {
      id: domain.id,
      name: domain.name,
      image_src: domain.image_src,
      nordigen_id: domain.nordigen_id,
      user_id: domain.user_id ?? null,
      countries: domain.countries ?? [],
    };
  }
}
