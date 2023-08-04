import { Injectable } from '@nestjs/common';
import { CreateInstitutionInput } from './dto/create-institution.input';
import { UpdateInstitutionInput } from './dto/update-institution.input';
import { InstitutionRepository } from './institutions.repository';
import { InstitutionEntity } from './models/institution.entity';

@Injectable()
export class InstitutionsService {
  constructor(private repository: InstitutionRepository) {}

  create(createInstitutionInput: CreateInstitutionInput) {
    return 'This action adds a new institution';
  }

  findAll(): Promise<InstitutionEntity[]> {
    return this.repository.findAll();
  }

  findOne(id: string): Promise<InstitutionEntity> {
    return this.repository.findById(id);
  }

  update(id: string, updateInstitutionInput: UpdateInstitutionInput) {
    return `This action updates a #${id} institution`;
  }

  remove(id: number) {
    return `This action removes a #${id} institution`;
  }
}
