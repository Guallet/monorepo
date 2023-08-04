import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsResolver } from './institutions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { InstitutionEntity } from './models/institution.entity';
import { InstitutionRepository } from './institutions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InstitutionEntity])],
=======
import { InstitutionRepository } from './institutions.repository';
import { Institution } from './models/institution.model';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
>>>>>>> 0f98217 (feat: institutions and accounts relations)
  providers: [InstitutionsResolver, InstitutionsService, InstitutionRepository],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
