import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsResolver } from './institutions.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institution } from './entities/institution.entity';
import { InstitutionsController } from './institutions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  controllers: [InstitutionsController],
  providers: [InstitutionsResolver, InstitutionsService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
