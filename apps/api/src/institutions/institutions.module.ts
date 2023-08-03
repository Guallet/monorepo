import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsResolver } from './institutions.resolver';

@Module({
  providers: [InstitutionsResolver, InstitutionsService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
