import { Injectable, Logger } from '@nestjs/common';
import { InstitutionsService } from 'src/institutions/institutions.service';
import { Institution } from 'src/institutions/models/institution.model';
import { NordigenInstitutionDto } from 'src/nordigen/dto/nordigen-institution.dto';
import { NordigenService } from 'src/nordigen/nordigen.service';

// TODO: This is already defined in OpenBankingService
// Refactor the code so this is not duplicated. Maybe saved in the DB?
export const supportedCountries = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', //Czechia
  'DK', //Denmark
  'EE', //Estonia
  'FI', //Finland
  'FR', //France
  'DE', //Germany
  'GR', //Greece
  'HU', //Hungary
  'IS', //Iceland
  'IE', //Ireland
  'IT', //Italy
  'LV', //Latvia
  'LI', //Liechtenstein
  'LT', //Lithuania
  'LU', //Luxembourg
  'MT', //Malta
  'NL', //Netherlands
  'NO', //Norway
  'PL', //Poland
  'PT', //Portugal
  'RO', //Romania
  'SK', //Slovakia
  'SI', //Slovenia
  'ES', //Spain
  'SE', //Sweden
  'GB', //United Kingdom
];

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private nordigenService: NordigenService,
    private institutionsService: InstitutionsService,
  ) {}

  async syncOpenBankingInstitutions() {
    for (const country of supportedCountries) {
      this.logger.debug(`Syncing Open Banking institutions for ${country}`);
      const institutions = await this.nordigenService.getInstitutions(country);
      const entities = institutions.map((x: NordigenInstitutionDto) => {
        const bank = new Institution();
        bank.nordigen_id = x.id;
        bank.name = x.name;
        bank.image_src = x.logo;
        bank.countries = x.countries;

        return bank;
      });
      this.institutionsService.saveAll(entities);
    }

    this.logger.debug('Syncing Open Banking institutions completed');
  }
}
