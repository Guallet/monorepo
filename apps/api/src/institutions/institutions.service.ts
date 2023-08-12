import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Institution } from './models/institution.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto';

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);

  constructor(
    @InjectRepository(Institution)
    private repository: Repository<Institution>,
  ) {}

  findAll(args: { user_id: string } | null = null): Promise<Institution[]> {
    if (args?.user_id) {
      return this.repository.find({
        where: {
          user_id: args.user_id,
        },
      });
    } else {
      return this.repository.find();
    }
  }

  findOne(id: string): Promise<Institution> {
    return this.repository.findOne({
      where: {
        id: id,
        // user_id: args.user_id,
      },
    });
  }

  create(dto: CreateInstitutionRequest, user_id: string = null) {
    return this.repository.save({
      name: dto.name,
      image_src: dto.image_src,
      user_id: user_id,
    });
  }

  async update(id: string, dto: UpdateInstitutionRequest) {
    const institutionToUpdate = await this.findOne(id);
    if (institutionToUpdate) {
      institutionToUpdate.name = dto.name;
      institutionToUpdate.image_src = dto.image_src;

      return await this.repository.save(institutionToUpdate);
    } else {
      throw new NotFoundException();
    }
  }

  async remove(id: string): Promise<Institution> {
    const entityToDelete = await this.findOne(id);
    if (entityToDelete) {
      this.logger.debug(`Deleting institution id ${entityToDelete.id}`);
      const deleted = await this.repository.remove(entityToDelete);

      // Remove returns the object without the ID. So rehydrate the returned object with
      // the original id.
      // As alternative, it would be possible to use `softRemoved` which returns the ID
      const result = { ...deleted, id: id };
      return result;
    } else {
      throw new NotFoundException();
    }
  }
}
