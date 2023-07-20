import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NordigenService } from './nordigen.service';
import { NordigenRepository } from './nordigen.repository';
import { NordigenToken } from './entities/nordigenToken.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([NordigenToken])],
  providers: [NordigenService, NordigenRepository],
  exports: [NordigenService, NordigenRepository],
})
export class NordigenModule {}
