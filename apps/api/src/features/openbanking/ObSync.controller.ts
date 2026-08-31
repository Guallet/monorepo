import { Controller, ForbiddenException, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { SyncService } from './sync.service.js';

@ApiTags('Open Banking')
@Controller('openbanking/sync')
export class ObASyncController {
  private readonly logger = new Logger(ObASyncController.name);

  constructor(private readonly syncService: SyncService) {}

  @Get('accounts')
  async getObAccounts(@RequestUser() user: UserPrincipal) {
    if (user.isAdmin()) {
      this.logger.log('Syncing accounts triggered by user: ' + user.id);
      const result = await this.syncService.syncConnectedAccounts();
      return result;
    } else {
      throw new ForbiddenException();
    }
  }
}
