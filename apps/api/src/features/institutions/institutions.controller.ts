import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto';
import { ApiTags } from '@nestjs/swagger';
import { InstitutionDto } from './dto/institution.dto';

@ApiTags('Bank institutions')
@Controller('institutions')
export class InstitutionsController {
  private readonly logger = new Logger(InstitutionsController.name);

  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  async getUserInstitutions(
    @RequestUser() user: UserPrincipal,
  ): Promise<InstitutionDto[]> {
    const institutions = await this.institutionsService.findAll({
      user_id: user.id,
    });
    return institutions.map((inst) => InstitutionDto.fromDomain(inst));
  }

  @Get(':id')
  async getInstitution(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<InstitutionDto> {
    const institution = await this.institutionsService.findOne({
      id: id,
      user_id: user.id,
    });

    if (!institution) {
      throw new NotFoundException(`Institution with id ${id} not found`);
    }
    return InstitutionDto.fromDomain(institution);
  }

  @Post()
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateInstitutionRequest,
  ): Promise<InstitutionDto> {
    const institution = await this.institutionsService.create({
      dto: dto,
      user_id: user.id,
    });
    return InstitutionDto.fromDomain(institution);
  }

  @Patch(':id')
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateInstitutionRequest,
  ): Promise<InstitutionDto> {
    const institution = await this.institutionsService.update({
      id: id,
      dto: dto,
      user_id: user.id,
    });
    return InstitutionDto.fromDomain(institution);
  }

  @Delete(':id')
  async remove(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<InstitutionDto> {
    const deletedEntity = await this.institutionsService.remove({
      id: id,
      user_id: user.id,
    });
    return InstitutionDto.fromDomain(deletedEntity);
  }
}
