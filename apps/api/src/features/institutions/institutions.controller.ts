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
import { InstitutionsService } from './institutions.service.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto.js';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto.js';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InstitutionDto } from './dto/institution.dto.js';

@ApiTags('Bank institutions')
@Controller('institutions')
export class InstitutionsController {
  private readonly logger = new Logger(InstitutionsController.name);

  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @ApiOperation({ summary: 'List the current user’s bank institutions' })
  @ApiResponse({ status: 200, type: [InstitutionDto] })
  async getUserInstitutions(
    @RequestUser() user: UserPrincipal,
  ): Promise<InstitutionDto[]> {
    const institutions = await this.institutionsService.findAll({
      user_id: user.id,
    });
    return institutions.map((inst) => InstitutionDto.fromDomain(inst));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank institution by ID' })
  @ApiParam({ name: 'id', description: 'Institution ID' })
  @ApiResponse({ status: 200, type: InstitutionDto })
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
  @ApiOperation({ summary: 'Create a bank institution' })
  @ApiBody({ type: CreateInstitutionRequest })
  @ApiResponse({ status: 201, type: InstitutionDto })
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
  @ApiOperation({ summary: 'Update a bank institution' })
  @ApiParam({ name: 'id', description: 'Institution ID' })
  @ApiBody({ type: UpdateInstitutionRequest })
  @ApiResponse({ status: 200, type: InstitutionDto })
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
  @ApiOperation({ summary: 'Delete a bank institution' })
  @ApiParam({ name: 'id', description: 'Institution ID' })
  @ApiResponse({ status: 200, type: InstitutionDto })
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
