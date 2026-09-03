import { Controller, Get, Logger, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NordigenAccountMetadataDto } from '../../features/nordigen/dto/nordigen-account.dto.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { OpenbankingService } from './openbanking.service.js';
import { OpenBankingAccountIdsResponseDto } from './dto/openbanking-response.dto.js';

@ApiTags('Open Banking')
@Controller('openbanking/accounts')
export class ObAccountsController {
  private readonly logger = new Logger(ObAccountsController.name);

  constructor(private readonly openbankingService: OpenbankingService) {}

  @Get()
  @ApiOperation({ summary: 'List Open Banking accounts' })
  @ApiResponse({ status: 200, type: OpenBankingAccountIdsResponseDto })
  async getObAccounts(
    @RequestUser() user: UserPrincipal,
  ): Promise<OpenBankingAccountIdsResponseDto> {
    this.logger.debug(`Getting Open Banking accounts for user ${user.id}`);
    const accounts = await this.openbankingService.getLinkedAccounts(user.id);
    return { accounts: accounts.map((account) => account.id) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Open Banking account metadata' })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Open Banking account ID',
  })
  @ApiResponse({ status: 200, type: NordigenAccountMetadataDto })
  async getObAccount(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.openbankingService.getAccountMetadata(user.id, id);
  }
}
