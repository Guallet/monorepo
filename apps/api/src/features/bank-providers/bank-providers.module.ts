import { Module } from '@nestjs/common';
import { BankSyncModule } from '../banksync/banksync.module';
import { LunchFlowModule } from '../lunchflow/lunchflow.module';
import { SynciModule } from '../synci/synci.module';
import { BankProvidersController } from './bank-providers.controller';

@Module({
  imports: [BankSyncModule, LunchFlowModule, SynciModule],
  controllers: [BankProvidersController],
})
export class BankProvidersModule {}
