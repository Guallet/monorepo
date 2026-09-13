import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { SyncService } from 'src/features/openbanking/sync.service';

@ApiTags('Admin Tasks')
@Controller('admin')
export class AdminController {
  constructor(private readonly syncService: SyncService) {}

  @ApiOperation({ summary: 'syncBanks' })
  @ApiOkResponse({ description: 'Request completed successfully' })
  @Get('sync/institutions')
  async syncBanks(@RequestUser() user: UserPrincipal): Promise<void> {
    if (user.isAdmin()) {
      await this.syncService.syncOpenBankingInstitutions();
    } else {
      throw new ForbiddenException();
    }
  }
}
