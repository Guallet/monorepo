import { Controller, ForbiddenException, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { SyncService } from 'src/openbanking/sync.service';

@ApiTags('Admin Tasks')
@Controller('admin')
export class AdminController {
  constructor(private readonly syncService: SyncService) {}

  @HttpCode(202)
  @Get('sync/institutions')
  async syncBanks(@RequestUser() user: UserPrincipal) {
    if (user.isAdmin()) {
      this.syncService.syncOpenBankingInstitutions();
    } else {
      throw new ForbiddenException();
    }
  }
}
