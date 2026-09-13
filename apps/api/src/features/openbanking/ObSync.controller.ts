import { Controller, ForbiddenException, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { SyncService } from './sync.service';
import { SyncAccountsResponseDto } from './dto/openbanking-response.dto';

@ApiTags('Open Banking')
@Controller('openbanking/sync')
export class ObASyncController {
  private readonly logger = new Logger(ObASyncController.name);

  constructor(private readonly syncService: SyncService) {}

  @ApiOperation({ summary: 'getObAccounts' })
  @ApiOkResponse({ type: SyncAccountsResponseDto })
  @Get('accounts')
  async getObAccounts(
    @RequestUser() user: UserPrincipal,
  ): Promise<SyncAccountsResponseDto> {
    if (user.isAdmin()) {
      this.logger.log('Syncing accounts triggered by user: ' + user.id);
      const result = await this.syncService.syncConnectedAccounts();
      return result;
    } else {
      throw new ForbiddenException();
    }
  }
}
