import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenRequisition } from '../entities/nordigenRequisition.entity';

@Injectable()
export class RequisitionRepository {
  constructor(
    @InjectRepository(NordigenRequisition)
    private repository: Repository<NordigenRequisition>,
  ) {}

  async save(requisition: NordigenRequisition): Promise<NordigenRequisition> {
    return await this.repository.save(requisition);
  }

  async update(requisition: NordigenRequisition) {
    await this.repository.upsert(requisition, {
      conflictPaths: ['id'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async deleteRequisitionId(id: string) {
    await this.repository.delete({
      id: id,
    });

    return id;
  }

  async deleteRequisition(requisition: NordigenRequisition) {
    await this.repository.delete({
      id: requisition.id,
    });

    return requisition;
  }
}
