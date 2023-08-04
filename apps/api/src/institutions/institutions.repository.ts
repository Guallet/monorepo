import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
<<<<<<< HEAD
import { InstitutionEntity } from './models/institution.entity';
=======
import { Institution } from './models/institution.model';
>>>>>>> 0f98217 (feat: institutions and accounts relations)

@Injectable()
export class InstitutionRepository {
  private readonly logger = new Logger(InstitutionRepository.name);

  constructor(
<<<<<<< HEAD
    @InjectRepository(InstitutionEntity)
    private repository: Repository<InstitutionEntity>,
=======
    @InjectRepository(Institution)
    private repository: Repository<Institution>,
>>>>>>> 0f98217 (feat: institutions and accounts relations)
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

<<<<<<< HEAD
  async save(entity: InstitutionEntity): Promise<InstitutionEntity> {
    return await this.repository.save(entity);
  }

  async saveAll(entities: InstitutionEntity[]): Promise<InstitutionEntity[]> {
=======
  async save(entity: Institution): Promise<Institution> {
    return await this.repository.save(entity);
  }

  async saveAll(entities: Institution[]): Promise<Institution[]> {
>>>>>>> 0f98217 (feat: institutions and accounts relations)
    await this.repository.upsert(entities, ['id']);

    return entities;
  }
}
