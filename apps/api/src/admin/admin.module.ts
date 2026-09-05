import { Module } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';
import { OpenbankingModule } from '../features/openbanking/openbanking.module.js';

@Module({
  imports: [OpenbankingModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
