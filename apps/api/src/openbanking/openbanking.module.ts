import { Module } from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';
import { ObConnectionsController } from './connections.controller';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { NordigenModule } from 'src/nordigen/nordigen.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ObConnection } from './entities/connection.entity';

@Module({
  imports: [
    HttpModule,
    NordigenModule,
    TypeOrmModule.forFeature([ObConnection]),
  ],
  controllers: [ObConnectionsController],
  providers: [OpenbankingService, NordigenService],
})
export class OpenbankingModule {}
