import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NordigenService } from './nordigen.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NordigenToken } from './entities/nordigen-token.entity.js';
import { NordigenRepository } from './nordigen.repository.js';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([NordigenToken])],
  providers: [NordigenService, NordigenRepository],
  exports: [NordigenService, NordigenRepository],
})
export class NordigenModule {}
