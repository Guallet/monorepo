import {
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiAcceptedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHash } from 'crypto';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import {
  BankSyncCredentialDto,
  BankSyncJobAcceptedDto,
  BankSyncJobStatusDto,
} from './dto/banksync.dto';
import {
  ValidatedImportBankSyncAccountsDto,
  ValidatedUnlinkBankSyncAccountDto,
} from './dto/import-banksync-accounts.dto';
import { ValidatedSaveBankSyncCredentialDto } from './dto/save-banksync-credential.dto';
import { BankSyncService } from './banksync.service';
import {
  BANKSYNC_JOB,
  BANKSYNC_QUEUE,
  BankSyncJobData,
} from './banksync.processor';

@Controller('banksync')
@ApiTags('BankSync')
@UseGuards(ThrottlerGuard)
export class BankSyncController {
  constructor(
    private readonly bankSync: BankSyncService,
    @InjectQueue(BANKSYNC_QUEUE)
    private readonly jobs: Queue<BankSyncJobData>,
  ) {}

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

  @Post('accounts/list')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue BankSync account discovery' })
  @ApiAcceptedResponse({ type: BankSyncJobAcceptedDto })
  async getAccounts(@RequestUser() user: UserPrincipal) {
    return this.enqueue(user.id, 'list');
  }

  @Post('accounts/import')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue selected BankSync account imports' })
  @ApiBody({ type: ValidatedImportBankSyncAccountsDto })
  @ApiAcceptedResponse({ type: BankSyncJobAcceptedDto })
  async importAccounts(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ValidatedImportBankSyncAccountsDto,
  ) {
    return this.enqueue(user.id, 'import', dto.accounts);
  }

  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue a sync of linked BankSync accounts' })
  @ApiAcceptedResponse({ type: BankSyncJobAcceptedDto })
  async sync(@RequestUser() user: UserPrincipal) {
    return this.enqueue(user.id, 'sync');
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get BankSync job status' })
  @ApiParam({ name: 'jobId', type: String })
  @ApiOkResponse({ type: BankSyncJobStatusDto })
  async getJobStatus(
    @RequestUser() user: UserPrincipal,
    @Param('jobId') jobId: string,
  ): Promise<BankSyncJobStatusDto> {
    if (!jobId.startsWith(`${user.id}_`)) throw new NotFoundException();
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
    if (status === 'failed') {
      return { status, error: 'BankSync job failed' };
    }
    return {
      status,
      ...(status === 'completed'
        ? { result: job.returnvalue as Record<string, unknown> }
        : {}),
    };
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

  private async enqueue(
    userId: string,
    operation: BankSyncJobData['operation'],
    selections?: BankSyncJobData['selections'],
  ): Promise<BankSyncJobAcceptedDto> {
    const importId =
      operation === 'import'
        ? `_${createHash('sha256')
            .update(
              JSON.stringify(
                [...(selections ?? [])].sort(
                  (left, right) =>
                    left.bankId.localeCompare(right.bankId) ||
                    left.accountId.localeCompare(right.accountId),
                ),
              ),
            )
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
    const job = await this.jobs.add(
      BANKSYNC_JOB,
      { userId, operation, selections },
      {
        jobId,
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 3600 },
      },
    );
    return { jobId: String(job.id) };
  }
}
