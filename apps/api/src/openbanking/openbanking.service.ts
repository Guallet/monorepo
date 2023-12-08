import { Injectable, Logger } from '@nestjs/common';
import { CreateOpenbankingDto } from './dto/create-openbanking.dto';
import { UpdateOpenbankingDto } from './dto/update-openbanking.dto';
import { NordigenRequisitionDto } from 'src/nordigen/dto/nordigen-requisition.dto';
import { ObConnection } from './entities/connection.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

const supportedCountries = [
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
export class OpenbankingService {
  private readonly logger = new Logger(OpenbankingService.name);

  constructor(
    @InjectRepository(ObConnection)
    private repository: Repository<ObConnection>,
  ) {}

  async getAvailableCountries(locale: string) {
    return supportedCountries.map((code) => {
      const regionNames = new Intl.DisplayNames([locale], {
        type: 'region',
      });

      return {
        code: code,
        name: regionNames.of(code),
      };
    });
  }

  create(createOpenbankingDto: CreateOpenbankingDto) {
    return 'This action adds a new openbanking';
  }

  findAll() {
    return `This action returns all openbanking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} openbanking`;
  }

  update(id: number, updateOpenbankingDto: UpdateOpenbankingDto) {
    return `This action updates a #${id} openbanking`;
  }

  remove(id: number) {
    return `This action removes a #${id} openbanking`;
  }

  saveRequisition(user_id: string, dto: NordigenRequisitionDto) {
    const connection = new ObConnection();
    connection.id = dto.id;
    connection.created = dto.created;
    connection.redirect = dto.redirect;
    connection.status = dto.status;
    connection.institution_id = dto.institution_id;
    connection.agreement = dto.agreement;
    connection.reference = dto.reference;
    connection.user_id = user_id;
    connection.accounts = dto.accounts;
    connection.user_language = dto.user_language;
    connection.link = dto.link;
    connection.ssn = dto.ssn;
    connection.account_selection = dto.account_selection;
    connection.redirect_immediate = dto.redirect_immediate;
    this.repository.save(connection);
  }
}
