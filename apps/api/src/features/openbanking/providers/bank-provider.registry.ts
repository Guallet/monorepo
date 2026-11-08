import { BANKSYNC_SUPPORTED_COUNTRIES } from './banksync/countries';
import { LUNCHFLOW_SUPPORTED_COUNTRIES } from './lunchflow/countries';
import { SYNCI_SUPPORTED_COUNTRIES } from './synci/countries';
import { NORDIGEN_SUPPORTED_COUNTRIES } from './nordigen/countries';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BankSyncService } from './banksync/banksync.service';
import { LunchFlowService } from './lunchflow/lunchflow.service';
import { SynciService } from './synci/synci.service';
import { NordigenService } from './nordigen/nordigen.service';
import { BankProviderAdapter, BankProvider } from './bank-provider.interface';
import { BankProviderDto } from '../dto/openbanking.dto';

@Injectable()
export class BankProviderRegistry {
  private readonly adapters: Record<BankProvider, BankProviderAdapter>;

  constructor(
    lunchflow: LunchFlowService,
    banksync: BankSyncService,
    synci: SynciService,
    nordigen: NordigenService,
  ) {
    this.adapters = { lunchflow, banksync, synci, nordigen };
  }

  get(providerId: BankProvider): BankProviderAdapter {
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
        supportedCountries: [...LUNCHFLOW_SUPPORTED_COUNTRIES],
        name: 'Lunch Flow',
        credentialFields: [{ name: 'apiKey', secret: true }],
        supportsBankAuthorization: false,
      },
      {
        id: 'banksync',
        supportedCountries: [...BANKSYNC_SUPPORTED_COUNTRIES],
        name: 'BankSync',
        credentialFields: [{ name: 'apiKey', secret: true }],
        supportsBankAuthorization: false,
      },
      {
        id: 'synci',
        supportedCountries: [...SYNCI_SUPPORTED_COUNTRIES],
        name: 'Synci',
        credentialFields: [{ name: 'apiKey', secret: true }],
        supportsBankAuthorization: false,
      },
      {
        id: 'nordigen',
        supportedCountries: [...NORDIGEN_SUPPORTED_COUNTRIES],
        name: 'Nordigen',
        credentialFields: [
          { name: 'secretId', secret: false },
          { name: 'secretKey', secret: true },
        ],
        supportsBankAuthorization: true,
      },
    ];
  }
}
