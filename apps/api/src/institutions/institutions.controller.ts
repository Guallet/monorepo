import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto';

@Controller('institutions')
export class InstitutionsController {
  private readonly logger = new Logger(InstitutionsController.name);

  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  async getUserInstitutions(@RequestUser() user: UserPrincipal) {
    const institutions = await this.institutionsService.findAll({
      user_id: user.id,
    });
    return institutions;
  }

  @Get(':id')
  async getInstitution(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ) {
    return this.institutionsService.findOne({ id: id, user_id: user.id });
  }

  @Post()
  create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateInstitutionRequest,
  ) {
    return this.institutionsService.create({
      dto: dto,
      user_id: user.id,
    });
  }

  @Patch(':id')
  update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateInstitutionRequest,
  ) {
    return this.institutionsService.update({
      id: id,
      dto: dto,
      user_id: user.id,
    });
  }

  @Delete(':id')
  remove(@RequestUser() user: UserPrincipal, @Param('id') id: string) {
    return this.institutionsService.remove({
      id: id,
      user_id: user.id,
    });
  }
}
