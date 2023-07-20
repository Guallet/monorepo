import { Institution } from '../entities/insititution.entity';

export class InstitutionDto {
  id: string;
  name: string;
  open_banking_id: string;
  image_src: string;

  constructor(entity: Institution) {
    this.id = entity.id;
    this.name = entity.name;
    this.open_banking_id = entity.nordigen_id;
    this.image_src = entity.image_src;
  }
}
