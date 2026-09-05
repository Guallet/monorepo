import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequestUser } from '../auth/request-user.decorator.js';
import { UserPrincipal } from '../auth/user-principal.js';
import { SyncService } from '../features/openbanking/sync.service.js';

@ApiTags('Admin Tasks')
@Controller('admin')
export class AdminController {
  constructor(private readonly syncService: SyncService) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Get('sync/institutions')
  @ApiOperation({ summary: 'Synchronize Open Banking institutions' })
  @ApiAcceptedResponse({ description: 'Institution synchronization queued' })
  @ApiForbiddenResponse({
    description: 'The current user is not an administrator',
  })
  async syncBanks(@RequestUser() user: UserPrincipal): Promise<void> {
    if (user.isAdmin()) {
      await this.syncService.syncOpenBankingInstitutions();
    } else {
      throw new ForbiddenException();
    }
  }
}
