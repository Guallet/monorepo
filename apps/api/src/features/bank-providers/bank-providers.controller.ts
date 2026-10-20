import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Queue } from 'bullmq';
import type { Response } from 'express';
import { createHash } from 'node:crypto';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import {
  BankSyncJobAcceptedDto,
  BankSyncJobStatusDto,
} from '../banksync/dto/banksync.dto';
import {
  BANKSYNC_JOB,
  BankSyncJobData,
  BANKSYNC_QUEUE,
} from '../banksync/banksync.processor';
import { BankSyncService } from '../banksync/banksync.service';
import { LunchFlowService } from '../lunchflow/lunchflow.service';
import { SynciService } from '../synci/synci.service';
import {
  BankProviderAccountsResponseDto,
  BankProviderCredentialDto,
  BankProviderImportResponseDto,
  BankProviderSyncResponseDto,
} from './dto/bank-providers.dto';

export const BANK_PROVIDER_IDS = ['banksync', 'lunchflow', 'synci'] as const;
export type BankProviderId = (typeof BANK_PROVIDER_IDS)[number];

export class SaveBankProviderCredentialsDto {
  @ApiProperty({ maxLength: 4096 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  apiKey: string;
}

export class ImportBankProviderAccountsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  accountIds: string[];
}

@Controller('bank-providers/:providerId')
@ApiTags('Bank Providers')
@UseGuards(ThrottlerGuard)
export class BankProvidersController {
  constructor(
    private readonly bankSync: BankSyncService,
    private readonly lunchFlow: LunchFlowService,
    private readonly synci: SynciService,
    @InjectQueue(BANKSYNC_QUEUE)
    private readonly jobs: Queue<BankSyncJobData>,
  ) {}

  @Get('credentials')
  @ApiOperation({ summary: 'Get bank provider credential status' })
  @ApiParam({ name: 'providerId', enum: BANK_PROVIDER_IDS })
  @ApiOkResponse({ type: BankProviderCredentialDto })
  async getCredentials(
    @Param('providerId') providerId: string,
    @RequestUser() user: UserPrincipal,
  ) {
    return await this.credentialService(providerId).getCredential(user.id);
  }

  @Put('credentials')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Validate and save bank provider credentials' })
  @ApiParam({ name: 'providerId', enum: BANK_PROVIDER_IDS })
  @ApiBody({ type: SaveBankProviderCredentialsDto })
  @ApiOkResponse({ type: BankProviderCredentialDto })
  async saveCredentials(
    @Param('providerId') providerId: string,
    @RequestUser() user: UserPrincipal,
    @Body() dto: SaveBankProviderCredentialsDto,
  ) {
    return await this.credentialService(providerId).saveCredential({
      userId: user.id,
      apiKey: dto.apiKey,
    });
  }

  @Delete('credentials')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete bank provider credentials' })
  @ApiParam({ name: 'providerId', enum: BANK_PROVIDER_IDS })
  @ApiNoContentResponse()
  async deleteCredentials(
    @Param('providerId') providerId: string,
    @RequestUser() user: UserPrincipal,
  ): Promise<void> {
    await this.credentialService(providerId).deleteCredential(user.id);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List accounts available from a bank provider' })
  @ApiParam({ name: 'providerId', enum: BANK_PROVIDER_IDS })
  @ApiOkResponse({ type: BankProviderAccountsResponseDto })
  @ApiAcceptedResponse({ type: BankSyncJobAcceptedDto })
  async listAccounts(
    @Param('providerId') providerId: string,
    @RequestUser() user: UserPrincipal,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (providerId === 'banksync') {
      response.status(HttpStatus.ACCEPTED);
      return await this.enqueue(user.id, 'list');
    }
    return {
      accounts: await this.service(providerId).listRemoteAccounts(user.id),
    };
  }

  @Post('accounts/import')
  @ApiOperation({ summary: 'Import selected bank provider accounts' })
  @ApiParam({ name: 'providerId', enum: BANK_PROVIDER_IDS })
  @ApiBody({ type: ImportBankProviderAccountsDto })
  @ApiOkResponse({ type: BankProviderImportResponseDto })
  @ApiAcceptedResponse({ type: BankSyncJobAcceptedDto })
  async importAccounts(
    @Param('providerId') providerId: string,
    @RequestUser() user: UserPrincipal,
    @Body() dto: ImportBankProviderAccountsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (providerId === 'banksync') {
      response.status(HttpStatus.ACCEPTED);
      return await this.enqueue(
        user.id,
        'import',
        dto.accountIds.map((accountId) =>
          this.decodeBankSyncAccountId(accountId),
        ),
      );
    }
    return {
      accountIds: await this.service(providerId).importAccounts({
        userId: user.id,
        accountIds: dto.accountIds,
      }),
    };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync linked accounts for a bank provider' })
  @ApiParam({ name: 'providerId', enum: BANK_PROVIDER_IDS })
  @ApiOkResponse({ type: BankProviderSyncResponseDto })
  @ApiAcceptedResponse({ type: BankSyncJobAcceptedDto })
  async sync(
    @Param('providerId') providerId: string,
    @RequestUser() user: UserPrincipal,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (providerId === 'banksync') {
      response.status(HttpStatus.ACCEPTED);
      return await this.enqueue(user.id, 'sync');
    }
    return await this.service(providerId).syncUserAccounts(user.id);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get bank provider job status' })
  @ApiParam({ name: 'providerId', enum: BANK_PROVIDER_IDS })
  @ApiParam({ name: 'jobId', type: String })
  @ApiOkResponse({ type: BankSyncJobStatusDto })
  async getJobStatus(
    @Param('providerId') providerId: string,
    @Param('jobId') jobId: string,
    @RequestUser() user: UserPrincipal,
  ): Promise<BankSyncJobStatusDto> {
    if (providerId !== 'banksync' || !jobId.startsWith(`${user.id}_`)) {
      throw new NotFoundException();
    }
    const job = await this.jobs.getJob(jobId);
    if (!job) throw new NotFoundException();
    const state = await job.getState();
    const status =
      state === 'completed'
        ? 'completed'
        : state === 'failed'
          ? 'failed'
          : state === 'active'
            ? 'running'
            : 'queued';
    if (status === 'failed') return { status, error: 'BankSync job failed' };
    return {
      status,
      ...(status === 'completed'
        ? { result: job.returnvalue as Record<string, unknown> }
        : {}),
    };
  }

  @Delete('accounts/:accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink a bank provider account' })
  @ApiParam({ name: 'providerId', enum: BANK_PROVIDER_IDS })
  @ApiParam({ name: 'accountId', type: String })
  @ApiNoContentResponse()
  async unlinkAccount(
    @Param('providerId') providerId: string,
    @Param('accountId') accountId: string,
    @RequestUser() user: UserPrincipal,
  ): Promise<void> {
    if (providerId === 'banksync') {
      const selection = this.decodeBankSyncAccountId(accountId);
      await this.bankSync.unlinkAccount({
        userId: user.id,
        bankId: selection.bankId,
        accountId: selection.accountId,
      });
      return;
    }
    await this.service(providerId).unlinkAccount({
      userId: user.id,
      remoteAccountId: accountId,
    });
  }

  private credentialService(
    providerId: string,
  ): BankSyncService | LunchFlowService | SynciService {
    if (providerId === 'banksync') return this.bankSync;
    if (providerId === 'lunchflow') return this.lunchFlow;
    if (providerId === 'synci') return this.synci;
    throw new NotFoundException('Bank provider not found');
  }

  private service(providerId: string): LunchFlowService | SynciService {
    if (providerId === 'lunchflow') return this.lunchFlow;
    if (providerId === 'synci') return this.synci;
    throw new NotFoundException('Bank provider not found');
  }

  private async enqueue(
    userId: string,
    operation: BankSyncJobData['operation'],
    selections?: BankSyncJobData['selections'],
  ): Promise<BankSyncJobAcceptedDto> {
    const orderedSelections = [...(selections ?? [])].sort(
      (left, right) =>
        left.bankId.localeCompare(right.bankId) ||
        left.accountId.localeCompare(right.accountId),
    );
    const importId =
      operation === 'import'
        ? `_${createHash('sha256')
            .update(JSON.stringify(orderedSelections))
            .digest('hex')}`
        : '';
    const jobId = `${userId}_${operation}${importId}`;
    const previous = await this.jobs.getJob(jobId);
    if (previous) {
      const state = await previous.getState();
      if (state === 'completed' || state === 'failed') {
        await previous.remove();
      } else {
        return { jobId };
      }
    }
    await this.jobs.add(
      BANKSYNC_JOB,
      { userId, operation, selections },
      { jobId },
    );
    return { jobId };
  }

  private decodeBankSyncAccountId(value: string): {
    bankId: string;
    accountId: string;
  } {
    try {
      const parsed: unknown = JSON.parse(value);
      if (
        Array.isArray(parsed) &&
        parsed.length === 2 &&
        typeof parsed[0] === 'string' &&
        typeof parsed[1] === 'string'
      ) {
        return { bankId: parsed[0], accountId: parsed[1] };
      }
    } catch {
      // Fall through to a consistent validation error.
    }
    throw new BadRequestException('Invalid provider account id');
  }
}
