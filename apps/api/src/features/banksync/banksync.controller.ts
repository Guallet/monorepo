import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import {
  BankSyncAccountsResponseDto,
  BankSyncCredentialDto,
  BankSyncImportResponseDto,
  BankSyncSyncResponseDto,
} from './dto/banksync.dto';
import {
  ValidatedImportBankSyncAccountsDto,
  ValidatedUnlinkBankSyncAccountDto,
} from './dto/import-banksync-accounts.dto';
import { ValidatedSaveBankSyncCredentialDto } from './dto/save-banksync-credential.dto';
import { BankSyncService } from './banksync.service';

@Controller('banksync')
@ApiTags('BankSync')
@UseGuards(ThrottlerGuard)
export class BankSyncController {
  constructor(private readonly bankSync: BankSyncService) {}

  @Get('connection')
  @ApiOperation({ summary: 'Get BankSync credential status' })
  @ApiOkResponse({ type: BankSyncCredentialDto })
  async getConnection(@RequestUser() user: UserPrincipal) {
    return await this.bankSync.getCredential(user.id);
  }

  @Put('connection')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Save and validate a BankSync API key' })
  @ApiBody({ type: ValidatedSaveBankSyncCredentialDto })
  @ApiOkResponse({ type: BankSyncCredentialDto })
  async saveConnection(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ValidatedSaveBankSyncCredentialDto,
  ) {
    return await this.bankSync.saveCredential({
      userId: user.id,
      apiKey: dto.apiKey,
    });
  }

  @Delete('connection')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete BankSync credentials' })
  @ApiNoContentResponse()
  async deleteConnection(@RequestUser() user: UserPrincipal): Promise<void> {
    await this.bankSync.deleteCredential(user.id);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List bank accounts exposed by BankSync' })
  @ApiOkResponse({ type: BankSyncAccountsResponseDto })
  async getAccounts(@RequestUser() user: UserPrincipal) {
    return { accounts: await this.bankSync.listRemoteAccounts(user.id) };
  }

  @Post('accounts/import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import selected BankSync accounts' })
  @ApiBody({ type: ValidatedImportBankSyncAccountsDto })
  @ApiOkResponse({ type: BankSyncImportResponseDto })
  async importAccounts(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ValidatedImportBankSyncAccountsDto,
  ) {
    return {
      accountIds: await this.bankSync.importAccounts({
        userId: user.id,
        selections: dto.accounts,
      }),
    };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync linked BankSync accounts' })
  @ApiOkResponse({ type: BankSyncSyncResponseDto })
  async sync(@RequestUser() user: UserPrincipal) {
    return await this.bankSync.syncUserAccounts(user.id);
  }

  @Delete('accounts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink a BankSync account from Guallet' })
  @ApiBody({ type: ValidatedUnlinkBankSyncAccountDto })
  @ApiNoContentResponse()
  async unlinkAccount(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ValidatedUnlinkBankSyncAccountDto,
  ): Promise<void> {
    await this.bankSync.unlinkAccount({
      userId: user.id,
      bankId: dto.bankId,
      accountId: dto.accountId,
    });
  }
}
