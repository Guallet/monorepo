import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsResolver } from './institutions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from './models/institution.model';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  providers: [InstitutionsResolver, InstitutionsService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
