import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Institution } from './entities/institution.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto';

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);

  constructor(
    @InjectRepository(Institution)
    private repository: Repository<Institution>,
  ) {}

  findAll(args: { user_id?: string }): Promise<Institution[]> {
    this.logger.debug(`Getting all institutions for user ${args.user_id}`);

    // The institutions with null owner are common to everyone
    return this.repository.find({
      where: [{ user_id: args.user_id }, { user_id: IsNull() }],
    });
  }

  async findOne({
    id,
    user_id,
  }: {
    id: string;
    user_id: string | null;
  }): Promise<Institution> {
    // We want the user institutions, OR the common to all users
    const entity = await this.repository.findOne({
      where: {
        id: id,
      },
    });

    if (!entity) {
      throw new NotFoundException();
    }
    if (entity.user_id !== null && entity.user_id !== user_id) {
      // You cannot access institutions that are not yours
      // Return not found to avoid leaking information about the existence of the institution
      throw new NotFoundException();
    }
    return entity;
  }

  async findOneById(id: string): Promise<Institution> {
    const entity = await this.repository.findOne({
      where: {
        id: id,
      },
    });

    if (!entity) {
      throw new NotFoundException();
    }
    return entity;
  }

  async findOneByNordigenId(nordigen_id: string): Promise<Institution> {
    const entity = await this.repository.findOne({
      where: {
        nordigen_id: nordigen_id,
      },
    });
    if (!entity) {
      throw new NotFoundException();
    }
    return entity;
  }

  create(args: { dto: CreateInstitutionRequest; user_id: string }) {
    return this.repository.save({
      name: args.dto.name,
      image_src: args.dto.image_src,
      user_id: args.user_id,
    });
  }

  async update(args: {
    id: string;
    dto: UpdateInstitutionRequest;
    user_id: string;
  }) {
    const institutionToUpdate = await this.findOne({
      id: args.id,
      user_id: args.user_id,
    });

    if (institutionToUpdate) {
      if (institutionToUpdate.user_id === null) {
        // You cannot update common institutions!
        throw new ForbiddenException();
      }

      institutionToUpdate.name = args.dto.name ?? institutionToUpdate.name;
      institutionToUpdate.image_src =
        args.dto.image_src ?? institutionToUpdate.image_src;

      return await this.repository.save(institutionToUpdate);
    } else {
      throw new NotFoundException();
    }
  }

  async remove(args: { id: string; user_id: string }): Promise<Institution> {
    const entityToDelete = await this.findOne({
      id: args.id,
      user_id: args.user_id,
    });
    if (entityToDelete) {
      if (entityToDelete.user_id === null) {
        // You cannot delete common institutions!
        throw new ForbiddenException();
      }

      this.logger.debug(`Deleting institution id ${entityToDelete.id}`);
      const deleted = await this.repository.remove(entityToDelete);

      // Remove returns the object without the ID. So rehydrate the returned object with
      // the original id.
      // As alternative, it would be possible to use `softRemoved` which returns the ID
      const result = { ...deleted, id: args.id };
      return result;
    } else {
      throw new NotFoundException();
    }
  }

  // TODO: This only be called from admin, so check the role of the user calling this
  async saveAll(entities: Institution[]): Promise<Institution[]> {
    await this.repository.upsert(entities, ['nordigen_id']);
    return entities;
  }
}
