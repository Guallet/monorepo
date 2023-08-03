import { Injectable } from '@nestjs/common';
import { CreateInstitutionInput } from './dto/create-institution.input';
import { UpdateInstitutionInput } from './dto/update-institution.input';
import { Institution } from './entities/institution.model';

@Injectable()
export class InstitutionsService {
  create(createInstitutionInput: CreateInstitutionInput) {
    return 'This action adds a new institution';
  }

  institutions = [
    {
      id: '1',
      name: 'Monzo',
    },
    {
      id: '2',
      name: 'Natwest',
    },
  ];

  findAll(): Institution[] {
    return this.institutions;
  }

  findOne(id: string): Institution | null {
    return this.institutions.find((x) => x.id === id);
  }

  update(id: string, updateInstitutionInput: UpdateInstitutionInput) {
    return `This action updates a #${id} institution`;
  }

  remove(id: number) {
    return `This action removes a #${id} institution`;
  }
}
