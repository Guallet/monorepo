import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from './entities/insititution.entity';
import { InstitutionRepository } from './institution.repository';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  controllers: [InstitutionsController],
  providers: [InstitutionsService, InstitutionRepository],
  exports: [InstitutionsService, InstitutionRepository],
})
export class InstitutionsModule {}
