import { Injectable, Logger } from '@nestjs/common';
import { CreateInstitutionInput } from './dto/create-institution.input';
import { UpdateInstitutionInput } from './dto/update-institution.input';
import { Institution } from './models/institution.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);

  constructor(
    @InjectRepository(Institution)
    private repository: Repository<Institution>,
  ) {}

  findAll(): Promise<Institution[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Institution> {
    return this.repository.findOne({
      where: {
        id: id,
      },
    });
  }

  create(createInstitutionInput: CreateInstitutionInput) {
    return this.repository.save({
      name: createInstitutionInput.name,
      image_src: createInstitutionInput.image_src,
    });
  }

  async update(id: string, updateInstitutionInput: UpdateInstitutionInput) {
    const updated = await this.repository.save({
      id: id,
      name: updateInstitutionInput.name,
      image_src: updateInstitutionInput.image_src,
    });

    return updated;
  }

  remove(id: number) {
    return `This action removes a #${id} institution`;
  }
}
