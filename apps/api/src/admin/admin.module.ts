import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HttpModule } from '@nestjs/axios';
import { NordigenModule } from 'src/nordigen/nordigen.module';
import { InstitutionsModule } from 'src/institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NordigenToken } from 'src/nordigen/entities/nordigen-token.entity';
import { Institution } from 'src/institutions/models/institution.model';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { NordigenRepository } from 'src/nordigen/nordigen.repository';
import { InstitutionsService } from 'src/institutions/institutions.service';

@Module({
  imports: [
    HttpModule,
    NordigenModule,
    InstitutionsModule,
    TypeOrmModule.forFeature([NordigenToken, Institution]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    NordigenService,
    NordigenRepository,
    InstitutionsService,
  ],
})
export class AdminModule {}
