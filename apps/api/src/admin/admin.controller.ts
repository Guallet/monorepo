import { Controller, Get, HttpCode } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @HttpCode(202)
  @Get('sync/institutions')
  async syncBanks() {
    await this.adminService.syncOpenBankingInstitutions();
    return { message: 'Institutions sync' };
  }
}
