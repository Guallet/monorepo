import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsResolver } from './institutions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionEntity } from './models/institution.entity';
import { InstitutionRepository } from './institutions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InstitutionEntity])],
  providers: [InstitutionsResolver, InstitutionsService, InstitutionRepository],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
