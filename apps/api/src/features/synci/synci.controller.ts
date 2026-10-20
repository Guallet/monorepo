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
  SynciAccountsResponseDto,
  SynciCredentialDto,
  SynciImportResponseDto,
  SynciSyncResponseDto,
} from './dto/synci.dto';
import { ValidatedImportSynciAccountsDto } from './dto/import-synci-accounts.dto';
import { ValidatedSaveSynciCredentialDto } from './dto/save-synci-credential.dto';
import { SynciService } from './synci.service';

@Controller('synci')
@ApiTags('Synci')
@UseGuards(ThrottlerGuard)
export class SynciController {
  constructor(private readonly synciService: SynciService) {}

  @Get('connection')
  @ApiOperation({ summary: 'Get Synci credential status' })
  @ApiOkResponse({ type: SynciCredentialDto })
  async getConnection(
    @RequestUser() user: UserPrincipal,
  ): Promise<SynciCredentialDto> {
    return await this.synciService.getCredential(user.id);
  }

  @Put('connection')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Save and validate a Synci API key' })
  @ApiBody({ type: ValidatedSaveSynciCredentialDto })
  @ApiOkResponse({ type: SynciCredentialDto })
  async saveConnection(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ValidatedSaveSynciCredentialDto,
  ): Promise<SynciCredentialDto> {
    return await this.synciService.saveCredential({
      userId: user.id,
      apiKey: dto.apiKey,
    });
  }

  @Delete('connection')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Synci credentials' })
  @ApiNoContentResponse()
  async deleteConnection(@RequestUser() user: UserPrincipal): Promise<void> {
    await this.synciService.deleteCredential(user.id);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List accounts exposed by Synci' })
  @ApiOkResponse({ type: SynciAccountsResponseDto })
  async getAccounts(
    @RequestUser() user: UserPrincipal,
  ): Promise<SynciAccountsResponseDto> {
    return {
      accounts: await this.synciService.listRemoteAccounts(user.id),
    };
  }

  @Post('accounts/import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import selected Synci accounts' })
  @ApiBody({ type: ValidatedImportSynciAccountsDto })
  @ApiOkResponse({ type: SynciImportResponseDto })
  async importAccounts(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ValidatedImportSynciAccountsDto,
  ): Promise<SynciImportResponseDto> {
    return {
      accountIds: await this.synciService.importAccounts({
        userId: user.id,
        accountIds: dto.accountIds,
      }),
    };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync linked Synci accounts' })
  @ApiOkResponse({ type: SynciSyncResponseDto })
  async sync(
    @RequestUser() user: UserPrincipal,
  ): Promise<SynciSyncResponseDto> {
    return await this.synciService.syncUserAccounts(user.id);
  }

  @Delete('accounts/:accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink a Synci account from Guallet' })
  @ApiParam({ name: 'accountId', type: String })
  @ApiNoContentResponse()
  async unlinkAccount(
    @RequestUser() user: UserPrincipal,
    @Param('accountId') accountId: string,
  ): Promise<void> {
    await this.synciService.unlinkAccount({
      userId: user.id,
      remoteAccountId: accountId,
    });
  }
}
