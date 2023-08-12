import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InstitutionsService } from './institutions.service';
import { Institution } from './models/institution.model';
import { CreateInstitutionInput } from './dto/create-institution.input';
import { UpdateInstitutionInput } from './dto/update-institution.input';
import { Logger } from '@nestjs/common';
import { CreateInstitutionRequest } from './dto/createInstitutionRequest.dto';

@Resolver(() => Institution)
export class InstitutionsResolver {
  private readonly logger = new Logger(InstitutionsResolver.name);

  constructor(private readonly institutionsService: InstitutionsService) {}

  @Query(() => [Institution], { name: 'institutions' })
  findAll() {
    return this.institutionsService.findAll();
  }

  @Query(() => Institution, { name: 'institution' })
  findOne(@Args('id', { type: () => Int }) id: string) {
    return this.institutionsService.findOne(id);
  }

  @Mutation(() => Institution)
  createInstitution(
    @Args('createInstitutionInput')
    createInstitutionInput: CreateInstitutionInput,
  ) {
    return this.institutionsService.create(createInstitutionInput);
  }

  @Mutation(() => Institution)
  async updateInstitution(
    @Args('updateInstitutionInput')
    updateInstitutionInput: UpdateInstitutionInput,
  ) {
    return this.institutionsService.update(
      updateInstitutionInput.id,
      updateInstitutionInput,
    );
  }

  @Mutation(() => String)
  async newUpdateInstitution(
    @Args('id')
    id: string,
    @Args('name')
    name: string,
    @Args('image_src')
    image_src: string,
  ) {
    // return this.institutionsService.update(
    //   id,
    //   updateInstitutionInput,
    // );

    return `Called with : ${JSON.stringify({
      id: id,
      name: name,
      image_src: image_src,
    })}`;
  }

  @Mutation(() => String)
  async newNewUpdateInstitution(
    @Args('createInstitutionRequest')
    dto: CreateInstitutionRequest,
  ) {
    // return this.institutionsService.update(
    //   id,
    //   updateInstitutionInput,
    // );

    return `Called with : ${JSON.stringify({
      name: dto.name,
      image_src: dto.image_src,
    })}`;
  }
}
