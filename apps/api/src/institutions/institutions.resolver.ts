import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { InstitutionsService } from './institutions.service';
import { Institution } from './models/institution.model';
import { Logger, NotFoundException } from '@nestjs/common';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { RequestUser } from 'src/core/auth/request-user.decorator';

@Resolver(() => Institution)
export class InstitutionsResolver {
  private readonly logger = new Logger(InstitutionsResolver.name);

  constructor(private readonly institutionsService: InstitutionsService) {}

  @Query(() => [Institution], { name: 'institutions' })
  findAll(@RequestUser() user: UserPrincipal) {
    return this.institutionsService.findAll({
      user_id: user.id,
    });
  }

  @Query(() => Institution, { name: 'institution' })
  async findOne(
    @RequestUser() user: UserPrincipal,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const entity = await this.institutionsService.findOne({
      id: id,
      user_id: user.id,
    });
    if (entity) {
      return entity;
    }

    throw new NotFoundException();
  }

  @Mutation(() => Institution)
  createInstitution(
    @RequestUser() user: UserPrincipal,
    @Args('input')
    dto: CreateInstitutionRequest,
  ) {
    return this.institutionsService.create({
      dto: dto,
      user_id: user.id,
    });
  }

  @Mutation(() => Institution)
  async updateInstitution(
    @RequestUser() user: UserPrincipal,
    @Args('id')
    id: string,
    @Args('input')
    dto: UpdateInstitutionRequest,
  ) {
    this.logger.debug(`Updating institution ${id}`, dto);
    return this.institutionsService.update({
      id: id,
      dto: dto,
      user_id: user.id,
    });
  }

  @Mutation(() => Institution)
  async deleteInstitution(
    @RequestUser() user: UserPrincipal,
    @Args('id')
    id: string,
  ) {
    this.logger.debug(`Deleting institution ${id}`);
    return await this.institutionsService.remove({
      id: id,
      user_id: user.id,
    });
  }
}
