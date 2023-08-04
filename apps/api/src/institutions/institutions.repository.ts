import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './models/institution.model';

@Injectable()
export class InstitutionRepository {
  private readonly logger = new Logger(InstitutionRepository.name);

  constructor(
    @InjectRepository(Institution)
    private repository: Repository<Institution>,
  ) {}

  async findAll() {
    return this.repository.find();
  }

  async findById(id: string) {
    return this.repository.findOne({
      where: {
        id: id,
      },
    });
  }

  async save(entity: Institution): Promise<Institution> {
    return await this.repository.save(entity);
  }

  async saveAll(entities: Institution[]): Promise<Institution[]> {
    await this.repository.upsert(entities, ['id']);

    return entities;
  }
}
