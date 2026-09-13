import { Controller, Get, Logger, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { OpenbankingService } from './openbanking.service';
import { NordigenService } from 'src/features/nordigen/nordigen.service';
import { NordigenAccountMetadataDto } from '../nordigen/dto/nordigen-account.dto';
import { OpenBankingAccountsResponseDto } from './dto/openbanking-response.dto';

@ApiTags('Open Banking')
@Controller('openbanking/accounts')
export class ObAccountsController {
  private readonly logger = new Logger(ObAccountsController.name);

  constructor(
    private readonly openbankingService: OpenbankingService,
    private readonly nordigenService: NordigenService,
  ) {}

  @ApiOperation({ summary: 'getObAccounts' })
  @ApiOkResponse({ type: OpenBankingAccountsResponseDto })
  @Get()
  getObAccounts(
    @RequestUser() user: UserPrincipal,
  ): OpenBankingAccountsResponseDto {
    this.logger.debug(`Getting Open Banking accounts for user ${user.id}`);
    return { accounts: ['123456789', '987654321'] };
  }

  @ApiOperation({ summary: 'getObAccount' })
  @ApiOkResponse({ type: NordigenAccountMetadataDto })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id')
  async getObAccount(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NordigenAccountMetadataDto> {
    return await this.nordigenService.getAccountMetadata(id);
  }
}
