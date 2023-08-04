import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InstitutionsService } from './institutions.service';
import { Institution } from './models/institution.model';
import { CreateInstitutionInput } from './dto/create-institution.input';

@Resolver(() => Institution)
export class InstitutionsResolver {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Mutation(() => Institution)
  createInstitution(
    @Args('createInstitutionInput')
    createInstitutionInput: CreateInstitutionInput,
  ) {
    return this.institutionsService.create(createInstitutionInput);
  }

  @Query(() => [Institution], { name: 'institutions' })
  findAll() {
    return this.institutionsService.findAll();
  }

  @Query(() => Institution, { name: 'institution' })
  findOne(@Args('id', { type: () => Int }) id: string) {
    return this.institutionsService.findOne(id);
  }
}
