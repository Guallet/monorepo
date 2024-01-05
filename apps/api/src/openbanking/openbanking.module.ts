import { Module } from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';
import { ObConnectionsController } from './ObConnectionsController';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { NordigenModule } from 'src/nordigen/nordigen.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ObConnection } from './entities/connection.entity';
import { NordigenAccount } from './entities/nordigen-account.entity';
import { NordigenAccountRepository } from './repositories/nordigen-account.repository';
import { Account } from 'src/accounts/entities/account.entity';
import { InstitutionsModule } from 'src/institutions/institutions.module';
import { InstitutionsService } from 'src/institutions/institutions.service';
import { Institution } from 'src/institutions/entities/institution.entity';

@Module({
  imports: [
    HttpModule,
    NordigenModule,
    InstitutionsModule,
    TypeOrmModule.forFeature([
      ObConnection,
      NordigenAccount,
      Account,
      Institution,
    ]),
  ],
  controllers: [ObConnectionsController],
  providers: [
    OpenbankingService,
    NordigenService,
    NordigenAccountRepository,
    InstitutionsService,
  ],
})
export class OpenbankingModule {}
