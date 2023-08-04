import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsResolver } from './institutions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionRepository } from './institutions.repository';
import { Institution } from './models/institution.model';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  providers: [InstitutionsResolver, InstitutionsService, InstitutionRepository],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
