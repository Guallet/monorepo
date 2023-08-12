import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
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
    this.logger.debug(
      `Getting all institutions for user\n${JSON.stringify(user, null, 2)}`,
    );
    return this.institutionsService.findAll({
      user_id: user.id,
    });
  }

  @Query(() => Institution, { name: 'institution' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    const entity = await this.institutionsService.findOne(id);
    if (entity) {
      return entity;
    }

    throw new NotFoundException();
  }

  @Mutation(() => Institution)
  createInstitution(
    @Args('createInstitutionRequest')
    createInstitutionInput: CreateInstitutionRequest,
  ) {
    return this.institutionsService.create(
      createInstitutionInput,
      'my_user-id',
    );
  }

  @Mutation(() => Institution)
  async updateInstitution(
    @Args('id')
    id: string,
    @Args('updateInstitutionRequest')
    dto: UpdateInstitutionRequest,
  ) {
    this.logger.debug(`Updating institution ${id}`, dto);
    return this.institutionsService.update(id, dto);
  }

  @Mutation(() => Institution)
  async deleteInstitution(
    @Args('id')
    id: string,
  ) {
    this.logger.debug(`Deleting institution ${id}`);
    return await this.institutionsService.remove(id);
  }
}
