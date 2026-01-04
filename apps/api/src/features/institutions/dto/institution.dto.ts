import { Institution } from '../entities/institution.entity';

export class InstitutionDto {
  id: string;
  name: string;
  image_src?: string;
  nordigen_id?: string;

  static fromDomain(domain: Institution): InstitutionDto {
    return {
      id: domain.id,
      name: domain.name,
      image_src: domain.image_src,
      nordigen_id: domain.nordigen_id,
    };
  }
}
