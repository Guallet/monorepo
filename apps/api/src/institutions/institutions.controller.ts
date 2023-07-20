import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstitutionDto } from './dto/institution.dto';
import { InstitutionsService } from './institutions.service';

@ApiTags('Bank institutions')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly service: InstitutionsService) {}

  @Get()
  async getUserAccounts(): Promise<InstitutionDto[]> {
    const banks = await this.service.getAll();
    return banks.map((x) => new InstitutionDto(x));
  }
}
