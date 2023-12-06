import { Controller, Get, Param, Query } from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';
import { NordigenService } from 'src/nordigen/nordigen.service';

@Controller('openbanking/connections')
export class ObConnectionsController {
  constructor(
    private readonly openbankingService: OpenbankingService,
    private readonly nordigenService: NordigenService,
  ) {}

  @Get('countries')
  getCountries(@Query('language') language?: string) {
    return this.openbankingService.getAvailableCountries(language ?? 'en');
  }

  @Get(':country/institutions')
  getInstitutions(@Param('country') country: string) {
    // TODO: Cache this call in the DB? We should sync only once a day or less
    return this.nordigenService.getInstitutions(country);
  }
}
