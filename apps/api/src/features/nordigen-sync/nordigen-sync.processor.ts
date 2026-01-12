import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenAccount } from '../openbanking/entities/nordigen-account.entity';
import { Account } from '../accounts/entities/account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { NordigenUserService } from '../nordigen/nordigen-user.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { getMoneyBalanceFrom } from '../nordigen/dto/nordigen-balances.helper';

export const NORDIGEN_SYNC_QUEUE = 'nordigen-sync';
export const NORDIGEN_SYNC_JOB = 'process-nordigen-sync';

export interface NordigenSyncJobData {
  userId: string;
}

@Processor(NORDIGEN_SYNC_QUEUE)
export class NordigenSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(NordigenSyncProcessor.name);

  constructor(
    @InjectRepository(NordigenAccount)
    private readonly nordigenAccountsRepository: Repository<NordigenAccount>,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly nordigenUserService: NordigenUserService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async process(
    job: Job<NordigenSyncJobData>,
  ): Promise<{ accountsSynced: number; errors: string[] }> {
    const { userId } = job.data;
    this.logger.log(`Processing Nordigen sync job ${job.id} for user ${userId}`);

    const errors: string[] = [];
    let accountsSynced = 0;

    try {
      // Get the user's Nordigen credentials
      const user = await this.usersService.findUserData(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      if (!user.nordigen_secret_id || !user.nordigen_secret_key) {
        this.logger.warn(`User ${userId} has no Nordigen credentials`);
        return { accountsSynced: 0, errors: ['No Nordigen credentials found'] };
      }

      const credentials = {
        secretId: user.nordigen_secret_id,
        secretKey: user.nordigen_secret_key,
      };

      // Validate credentials by getting an access token
      try {
        await this.nordigenUserService.getAccessToken(credentials);
      } catch (error) {
        this.logger.error(`Failed to get Nordigen access token for user ${userId}`);
        
        // Send email to user about credential issues
        await this.emailService.sendNordigenCredentialsErrorEmail({
          to: user.email,
          userName: user.name || 'User',
        });
        
        throw new UnauthorizedException('Invalid Nordigen credentials');
      }

      // Get all accounts that need to be synced for this user
      // We need to find accounts linked to this user via the Account entity
      const userAccounts = await this.accountsRepository.find({
        where: { user_id: userId },
      });

      const userAccountIds = userAccounts.map(acc => acc.id);
      
      // Get Nordigen accounts linked to user's accounts
      const nordigenAccounts = await this.nordigenAccountsRepository
        .createQueryBuilder('na')
        .where('na.linked_account_id IN (:...accountIds)', { accountIds: userAccountIds.length > 0 ? userAccountIds : [''] })
        .andWhere('na.metadata_status = :status', { status: 'READY' })
        .getMany();

      this.logger.log(`Found ${nordigenAccounts.length} Nordigen accounts to sync for user ${userId}`);

      for (const nordigenAccount of nordigenAccounts) {
        try {
          await this.syncNordigenAccount(credentials, nordigenAccount);
          accountsSynced++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Error syncing account ${nordigenAccount.id}: ${errorMessage}`);
          this.logger.error(`Error syncing Nordigen account ${nordigenAccount.id}`, error);
        }
      }

      this.logger.log(`Nordigen sync completed for user ${userId}. Synced: ${accountsSynced}, Errors: ${errors.length}`);
    } catch (error) {
      this.logger.error(`Error in Nordigen sync job ${job.id} for user ${userId}`, error);
      throw error;
    }

    return { accountsSynced, errors };
  }

  private async syncNordigenAccount(
    credentials: { secretId: string; secretKey: string },
    nordigenAccount: NordigenAccount,
  ): Promise<void> {
    this.logger.log(`Syncing Nordigen account: ${nordigenAccount.id}`);

    if (!nordigenAccount.linked_account_id) {
      throw new Error(`Nordigen account ${nordigenAccount.id} has no linked account`);
    }

    const gualletAccount = await this.accountsRepository.findOne({
      where: { id: nordigenAccount.linked_account_id },
    });

    if (!gualletAccount) {
      throw new Error(`Linked account ${nordigenAccount.linked_account_id} not found`);
    }

    // Update account metadata
    const metadata = await this.nordigenUserService.getAccountMetadata(
      credentials,
      nordigenAccount.id,
    );
    nordigenAccount.metadata_raw = metadata;
    nordigenAccount.metadata_status = metadata.status;

    // Update account details
    const details = await this.nordigenUserService.getAccountDetails(
      credentials,
      nordigenAccount.id,
    );
    nordigenAccount.details_raw = details;
    nordigenAccount.status = details.status;

    // Sync balances
    const balances = await this.nordigenUserService.getAccountBalance(
      credentials,
      nordigenAccount.id,
    );
    const balance = getMoneyBalanceFrom(balances);
    if (balance) {
      gualletAccount.balance = balance.amount;
      await this.accountsRepository.save(gualletAccount);
    }

    // Sync transactions
    const transactions = await this.nordigenUserService.getAccountTransactions(
      credentials,
      nordigenAccount.id,
    );
    const transactionEntities = transactions.map((t) =>
      Transaction.fromNordigenDto(nordigenAccount.linked_account_id as string, t),
    );
    await this.transactionsRepository.upsert(transactionEntities, {
      conflictPaths: ['externalId'],
      skipUpdateIfNoValuesChanged: true,
    });

    // Update nordigen account last_refreshed
    nordigenAccount.last_refreshed = new Date();
    await this.nordigenAccountsRepository.save(nordigenAccount);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<NordigenSyncJobData>) {
    this.logger.log(`Nordigen sync job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<NordigenSyncJobData>, error: Error) {
    this.logger.error(`Nordigen sync job ${job.id} failed: ${error.message}`);
  }
}
