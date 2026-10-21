import { Injectable, NotFoundException } from '@nestjs/common';
import { BankSyncService } from '../../banksync/banksync.service';
import { LunchFlowService } from '../../lunchflow/lunchflow.service';
import { SynciService } from '../../synci/synci.service';
import { NordigenService } from '../../nordigen/nordigen.service';
import { BankProviderAdapter, BankProviderId } from './bank-provider.interface';
import { BankProviderDto } from '../dto/openbanking.dto';

@Injectable()
export class BankProviderRegistry {
  private readonly adapters: Record<BankProviderId, BankProviderAdapter>;
  constructor(
    lunchflow: LunchFlowService,
    banksync: BankSyncService,
    synci: SynciService,
    nordigen: NordigenService,
  ) {
    this.adapters = { lunchflow, banksync, synci, nordigen };
  }
  get(providerId: BankProviderId): BankProviderAdapter {
    const adapter = Object.prototype.hasOwnProperty.call(
      this.adapters,
      providerId,
    )
      ? this.adapters[providerId]
      : undefined;
    if (!adapter) throw new NotFoundException('Bank provider not found');
    return adapter;
  }
  list(): BankProviderDto[] {
    return [
      {
        id: 'lunchflow',
        name: 'Lunch Flow',
        credentialFields: [{ name: 'apiKey', secret: true }],
        supportsBankAuthorization: false,
      },
      {
        id: 'banksync',
        name: 'BankSync',
        credentialFields: [{ name: 'apiKey', secret: true }],
        supportsBankAuthorization: false,
      },
      {
        id: 'synci',
        name: 'Synci',
        credentialFields: [{ name: 'apiKey', secret: true }],
        supportsBankAuthorization: false,
      },
      {
        id: 'nordigen',
        name: 'Nordigen',
        credentialFields: [
          { name: 'secretId', secret: false },
          { name: 'secretKey', secret: true },
        ],
        supportsBankAuthorization: true,
        authorizationCountries: [
          'AT',
          'BE',
          'BG',
          'HR',
          'CY',
          'CZ',
          'DK',
          'EE',
          'FI',
          'FR',
          'DE',
          'GR',
          'HU',
          'IS',
          'IE',
          'IT',
          'LV',
          'LI',
          'LT',
          'LU',
          'MT',
          'NL',
          'NO',
          'PL',
          'PT',
          'RO',
          'SK',
          'SI',
          'ES',
          'SE',
          'GB',
        ],
      },
    ];
  }
}
