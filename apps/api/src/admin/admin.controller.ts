import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

// TODO: Should be this hidden in the final docs?
@ApiTags('Webhooks and admin tasks')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @HttpCode(202)
  @Get('sync/institutions')
  async syncBanks() {
    this.service.syncOpenBankingInstitutions();
    return;
  }

  @HttpCode(202)
  @Get('sync/accounts')
  async syncAccounts() {
    await this.service.syncConnectedAccounts();
    return {
      status: 202,
    };
  }
}
