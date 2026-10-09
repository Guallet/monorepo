import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Account } from '../accounts/entities/account.entity';
import { Institution } from './entities/institution.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto';

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);

  constructor(
    @InjectRepository(Institution)
    private repository: Repository<Institution>,
  ) {}

  findAll(args: { user_id: string }): Promise<Institution[]> {
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
      where: [
        { id, user_id: user_id ?? IsNull() },
        { id, user_id: IsNull() },
      ],
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

  async create({
    user_id,
    dto,
  }: {
    user_id: string;
    dto: CreateInstitutionRequest;
  }): Promise<Institution> {
    const entity = this.repository.create({
      name: dto.name,
      image_src: dto.image_src,
      countries: dto.country ? [dto.country] : [],
      user_id: user_id,
    });

    return await this.repository.save(entity);
  }

  async update({
    id,
    dto,
    user_id,
  }: {
    id: string;
    dto: UpdateInstitutionRequest;
    user_id: string;
  }) {
    const institutionToUpdate = await this.findOne({
      id: id,
      user_id: user_id,
    });

    if (institutionToUpdate) {
      if (institutionToUpdate.user_id === null) {
        // You cannot update system institutions!
        throw new ForbiddenException();
      }

      institutionToUpdate.name = dto.name ?? institutionToUpdate.name;
      if (dto.image_src !== undefined) {
        institutionToUpdate.image_src = dto.image_src;
      }

      // If the country is not null, add it to the list of countries, but don't repeat it
      if (dto.country) {
        institutionToUpdate.countries = Array.from(
          new Set([...(institutionToUpdate.countries ?? []), dto.country]),
        );
      }

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
        // You cannot delete system institutions!
        throw new ForbiddenException();
      }

      const hasAccounts = await this.repository.manager
        .getRepository(Account)
        .existsBy({ institutionId: args.id, user_id: args.user_id });
      if (hasAccounts) {
        throw new ConflictException(
          'Move accounts to another institution before deleting this one.',
        );
      }

      this.logger.debug(`Deleting institution id ${entityToDelete.id}`);
      let deleted: Institution;
      try {
        deleted = await this.repository.remove(entityToDelete);
      } catch (error) {
        // The foreign key also protects against accounts attached after the check.
        if (
          error instanceof QueryFailedError &&
          error.driverError?.code === '23503'
        ) {
          throw new ConflictException(
            'Move accounts to another institution before deleting this one.',
          );
        }
        throw error;
      }

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
