import {
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { SyncService } from './sync.service.js';
import { SyncOpenBankingAccountsResponseDto } from './dto/openbanking-response.dto.js';

@ApiTags('Open Banking')
@Controller('openbanking/sync')
export class ObASyncController {
  private readonly logger = new Logger(ObASyncController.name);

  constructor(private readonly syncService: SyncService) {}

  @Post('accounts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Synchronize connected Open Banking accounts' })
  @ApiResponse({ status: 200, type: SyncOpenBankingAccountsResponseDto })
  async getObAccounts(
    @RequestUser() user: UserPrincipal,
  ): Promise<SyncOpenBankingAccountsResponseDto> {
    if (user.isAdmin()) {
      this.logger.log('Syncing accounts triggered by user: ' + user.id);
      const result = await this.syncService.syncConnectedAccounts();
      return result;
    } else {
      throw new ForbiddenException();
    }
  }
}
