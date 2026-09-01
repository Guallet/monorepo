import { Controller, Get, Logger, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NordigenAccountMetadataDto } from '../../features/nordigen/dto/nordigen-account.dto.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { OpenbankingService } from './openbanking.service.js';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';

@ApiTags('Open Banking')
@Controller('openbanking/accounts')
export class ObAccountsController {
  private readonly logger = new Logger(ObAccountsController.name);

  constructor(
    private readonly openbankingService: OpenbankingService,
    private readonly nordigenService: NordigenService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List Open Banking accounts' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: { accounts: { type: 'array', items: { type: 'string' } } },
    },
  })
  getObAccounts(@RequestUser() user: UserPrincipal) {
    this.logger.debug(`Getting Open Banking accounts for user ${user.id}`);
    return { accounts: ['123456789', '987654321'] };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Open Banking account metadata' })
  @ApiParam({ name: 'id', description: 'Open Banking account ID' })
  @ApiResponse({ status: 200, type: NordigenAccountMetadataDto })
  async getObAccount(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.nordigenService.getAccountMetadata(id);
  }
}
