import { Injectable, Logger } from '@nestjs/common';
import { Institution } from './entities/insititution.entity';
import { InstitutionRepository } from './institution.repository';

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);

  constructor(private repository: InstitutionRepository) {}

  async getAll(): Promise<Institution[]> {
    return [];
  }

  async saveAll(institutions: Institution[]): Promise<Institution[]> {
    return await this.repository.saveAll(institutions);
  }
}
