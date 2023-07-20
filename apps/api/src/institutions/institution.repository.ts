import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/insititution.entity';

@Injectable()
export class InstitutionRepository {
  private readonly logger = new Logger(InstitutionRepository.name);

  constructor(
    @InjectRepository(Institution)
    private repository: Repository<Institution>,
  ) {}

  async find(accountId: string) {
    return this.repository.findOne({
      where: {
        id: accountId,
      },
    });
  }

  async findByNordigenId(nordigenId: string) {
    return this.repository.findOne({
      where: {
        nordigen_id: nordigenId,
      },
    });
  }

  async save(entity: Institution): Promise<Institution> {
    return await this.repository.save(entity);
  }

  async saveAll(entities: Institution[]): Promise<Institution[]> {
    await this.repository.upsert(entities, ['nordigen_id']);

    return entities;
  }
}
