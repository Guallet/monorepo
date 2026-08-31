import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from '../auth/request-user.decorator.js';
import { UserPrincipal } from '../auth/user-principal.js';
import { SyncService } from '../features/openbanking/sync.service.js';

@ApiTags('Admin Tasks')
@Controller('admin')
export class AdminController {
  constructor(private readonly syncService: SyncService) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Get('sync/institutions')
  async syncBanks(@RequestUser() user: UserPrincipal): Promise<void> {
    if (user.isAdmin()) {
      await this.syncService.syncOpenBankingInstitutions();
    } else {
      throw new ForbiddenException();
    }
  }
}
