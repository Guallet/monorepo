import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from './entities/institution.entity.js';
import { InstitutionsController } from './institutions.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  controllers: [InstitutionsController],
  providers: [InstitutionsService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
