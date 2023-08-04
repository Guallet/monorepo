import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionEntity } from './models/institution.entity';

@Injectable()
export class InstitutionRepository {
  private readonly logger = new Logger(InstitutionRepository.name);

  constructor(
    @InjectRepository(InstitutionEntity)
    private repository: Repository<InstitutionEntity>,
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

  async save(entity: InstitutionEntity): Promise<InstitutionEntity> {
    return await this.repository.save(entity);
  }

  async saveAll(entities: InstitutionEntity[]): Promise<InstitutionEntity[]> {
    await this.repository.upsert(entities, ['id']);

    return entities;
  }
}
