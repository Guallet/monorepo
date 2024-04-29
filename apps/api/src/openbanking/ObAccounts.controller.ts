import { Controller, Get, Logger, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { OpenbankingService } from './openbanking.service';
import { NordigenService } from 'src/nordigen/nordigen.service';

@ApiTags('Open Banking')
@Controller('openbanking/accounts')
export class ObAccountsController {
  private readonly logger = new Logger(ObAccountsController.name);

  constructor(
    private readonly openbankingService: OpenbankingService,
    private readonly nordigenService: NordigenService,
  ) {}

  @Get()
  getObAccounts(@RequestUser() user: UserPrincipal) {
    return { accounts: ['123456789', '987654321'] };
  }

  @Get(':id')
  async getObAccount(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.nordigenService.getAccountMetadata(id);
  }
}
