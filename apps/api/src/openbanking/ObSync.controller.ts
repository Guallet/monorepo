import { Controller, ForbiddenException, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { SyncService } from './sync.service';

@ApiTags('Open Banking')
@Controller('openbanking/sync')
export class ObASyncController {
  private readonly logger = new Logger(ObASyncController.name);

  constructor(private readonly syncService: SyncService) {}

  @Get('accounts')
  async getObAccounts(@RequestUser() user: UserPrincipal) {
    if (user.isAdmin()) {
      this.logger.log('Syncing accounts triggered by user: ' + user.id);
      try {
        await this.syncService.syncConnectedAccounts();
        return { status: 'SUCCESS' };
      } catch (error) {
        return { status: 'ERROR', error };
      }
    } else {
      throw new ForbiddenException();
    }
  }
}
