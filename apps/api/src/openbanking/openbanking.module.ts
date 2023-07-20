import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { AccountRepository } from 'src/accounts/repositories/account.repository';
import { Institution } from 'src/institutions/entities/insititution.entity';
import { InstitutionRepository } from 'src/institutions/institution.repository';
import { NordigenModule } from 'src/nordigen/nordigen.module';
import { NordigenAccount } from './entities/nordigenAccount.entity';
import { NordigenRequisition } from './entities/nordigenRequisition.entity';
import { OpenbankingController } from './openbanking.controller';
import { OpenbankingService } from './openbanking.service';
import { NordigenAccountRepository } from './repositories/nordigenAccount.repository';
import { RequisitionRepository } from './repositories/requisition.repository';

@Module({
  imports: [
    NordigenModule,
    TypeOrmModule.forFeature([
      NordigenRequisition,
      NordigenAccount,
      Account,
      Institution,
    ]),
  ],
  controllers: [OpenbankingController],
  providers: [
    OpenbankingService,
    RequisitionRepository,
    NordigenAccountRepository,
    AccountRepository,
    InstitutionRepository,
  ],
})
export class OpenBankingModule {}
