import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import {
  LunchFlowAccountsResponseDto,
  LunchFlowCredentialDto,
  LunchFlowImportResponseDto,
  LunchFlowSyncResponseDto,
} from './dto/lunchflow.dto';
import { ValidatedImportLunchFlowAccountsDto } from './dto/import-lunchflow-accounts.dto';
import { ValidatedSaveLunchFlowCredentialDto } from './dto/save-lunchflow-credential.dto';
import { LunchFlowService } from './lunchflow.service';

@Controller('lunchflow')
@ApiTags('Lunch Flow')
@UseGuards(ThrottlerGuard)
export class LunchFlowController {
  constructor(private readonly lunchFlowService: LunchFlowService) {}

  @Get('connection')
  @ApiOperation({ summary: 'Get Lunch Flow credential status' })
  @ApiOkResponse({ type: LunchFlowCredentialDto })
  async getConnection(
    @RequestUser() user: UserPrincipal,
  ): Promise<LunchFlowCredentialDto> {
    return await this.lunchFlowService.getCredential(user.id);
  }

  @Put('connection')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Save and validate a Lunch Flow API key' })
  @ApiBody({ type: ValidatedSaveLunchFlowCredentialDto })
  @ApiOkResponse({ type: LunchFlowCredentialDto })
  async saveConnection(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ValidatedSaveLunchFlowCredentialDto,
  ): Promise<LunchFlowCredentialDto> {
    return await this.lunchFlowService.saveCredential({
      userId: user.id,
      apiKey: dto.apiKey,
    });
  }

  @Delete('connection')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Lunch Flow credentials' })
  @ApiNoContentResponse()
  async deleteConnection(@RequestUser() user: UserPrincipal): Promise<void> {
    await this.lunchFlowService.deleteCredential(user.id);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List accounts exposed by Lunch Flow' })
  @ApiOkResponse({ type: LunchFlowAccountsResponseDto })
  async getAccounts(
    @RequestUser() user: UserPrincipal,
  ): Promise<LunchFlowAccountsResponseDto> {
    return {
      accounts: await this.lunchFlowService.listRemoteAccounts(user.id),
    };
  }

  @Post('accounts/import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import selected Lunch Flow accounts' })
  @ApiBody({ type: ValidatedImportLunchFlowAccountsDto })
  @ApiOkResponse({ type: LunchFlowImportResponseDto })
  async importAccounts(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ValidatedImportLunchFlowAccountsDto,
  ): Promise<LunchFlowImportResponseDto> {
    return {
      accountIds: await this.lunchFlowService.importAccounts({
        userId: user.id,
        accountIds: dto.accountIds,
      }),
    };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync linked Lunch Flow accounts' })
  @ApiOkResponse({ type: LunchFlowSyncResponseDto })
  async sync(
    @RequestUser() user: UserPrincipal,
  ): Promise<LunchFlowSyncResponseDto> {
    return await this.lunchFlowService.syncUserAccounts(user.id);
  }

  @Delete('accounts/:accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink a Lunch Flow account from Guallet' })
  @ApiParam({ name: 'accountId', type: String })
  @ApiNoContentResponse()
  async unlinkAccount(
    @RequestUser() user: UserPrincipal,
    @Param('accountId') accountId: string,
  ): Promise<void> {
    await this.lunchFlowService.unlinkAccount({
      userId: user.id,
      remoteAccountId: accountId,
    });
  }
}
