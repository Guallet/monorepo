import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Money } from '@guallet/money';
import { createHash } from 'node:crypto';
import { Account } from '../accounts/entities/account.entity';
import { AccountSource } from '../accounts/entities/accountSource.model';
import { Transaction } from '../transactions/entities/transaction.entity';
import { BankAuthorization } from '../openbanking/entities/bank-authorization.entity';
import {
  BankProviderAdapter,
  ProviderAccount,
  ProviderContext,
  ProviderIdentity,
  requireNordigenCredentials,
} from '../openbanking/providers/bank-provider.interface';
import { NordigenLink } from './entities/nordigen-link.entity';
import { NordigenClient } from './nordigen.client';
import { getAccountTypeFrom } from './dto/ExternalCashAccountType1Code.helper';
import { getMoneyBalanceFrom } from './dto/nordigen-balances.helper';

@Injectable()
export class NordigenService implements BankProviderAdapter {
  constructor(
    private readonly client: NordigenClient,
    @InjectRepository(BankAuthorization)
    private readonly authorizations: Repository<BankAuthorization>,
    @InjectRepository(NordigenLink)
    private readonly links: Repository<NordigenLink>,
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
  ) {}
  async validateCredentials(context: ProviderContext): Promise<void> {
    await this.token(context);
  }
  async getInstitutions(context: ProviderContext & { country: string }) {
    return await this.client.getInstitutions(
      await this.token(context),
      context.country,
    );
  }
  async authorize(
    context: ProviderContext & {
      institutionId: string;
      redirectUrl: string;
      reference: string;
    },
  ) {
    const result = await this.client.authorize(
      await this.token(context),
      context.institutionId,
      context.redirectUrl,
      context.reference,
    );
    return { remoteId: result.id, redirectUrl: result.link };
  }
  async completeAuthorization(context: ProviderContext & { remoteId: string }) {
    const result = await this.client.getAuthorization(
      await this.token(context),
      context.remoteId,
    );
    if (result.status !== 'LN')
      throw new BadRequestException('Bank authorization is not complete');
    return result.accounts;
  }
  async listAccounts(context: ProviderContext) {
    const ids = await this.authorizedIds(context);
    if (!ids.length) return [];
    const token = await this.token(context);
    const links = await this.links.find({
      where: { user_id: context.userId, is_linked: true },
    });
    const linkedById = new Map(
      links.map((link) => [link.remote_account_id, link.guallet_account_id]),
    );
    const discovered = await Promise.allSettled(
      ids.map(async (id) => {
        const account = await this.client.getDetails(token, id);
        return {
          id,
          name: account.name || account.ownerName || 'Bank account',
          institutionName: null,
          currency: account.currency ?? null,
          linkedAccountId: linkedById.get(id) ?? null,
        };
      }),
    );
    // Expired consent for one bank must not hide accounts from other banks.
    // Keep linked accounts visible so users can unlink and reauthorize them.
    if (
      discovered.every((result) => result.status === 'rejected') &&
      links.length === 0
    ) {
      throw new BadGatewayException('Bank accounts could not be refreshed');
    }
    return discovered.flatMap<ProviderAccount>((result, index) => {
      if (result.status === 'fulfilled') return [result.value];
      const linkedAccountId = linkedById.get(ids[index]);
      return linkedAccountId
        ? [
            {
              id: ids[index],
              name: 'Bank account',
              institutionName: null,
              currency: null,
              linkedAccountId,
              status: 'unavailable',
            },
          ]
        : [];
    });
  }
  async importAccounts(
    context: ProviderContext & { accountIds: string[] },
  ): Promise<string[]> {
    const allowed = new Set(await this.authorizedIds(context));
    if (context.accountIds.some((id) => !allowed.has(id)))
      throw new BadRequestException(
        'Account is not authorized for this connection',
      );
    const token = await this.token(context);
    const imported: string[] = [];
    for (const id of new Set(context.accountIds)) {
      imported.push(await this.importAccount(context.userId, token, id));
    }
    return imported;
  }
  async sync(context: ProviderContext) {
    const links = await this.links.find({
      where: { user_id: context.userId, is_linked: true },
    });
    const allowed = new Set(await this.authorizedIds(context));
    const token = await this.token(context);
    const errors: string[] = [];
    let accountsSynced = 0;
    for (const link of links) {
      try {
        if (!allowed.has(link.remote_account_id))
          throw new BadRequestException();
        await this.importAccount(context.userId, token, link.remote_account_id);
        accountsSynced++;
      } catch {
        errors.push(link.remote_account_id);
      }
    }
    return { accountsSynced, errors };
  }
  async unlinkAccount(
    context: ProviderIdentity & { accountId: string },
  ): Promise<void> {
    const result = await this.links.update(
      { user_id: context.userId, remote_account_id: context.accountId },
      { is_linked: false },
    );
    if (!result.affected) throw new NotFoundException();
  }
  async disconnect(context: ProviderIdentity): Promise<void> {
    await this.links.update({ user_id: context.userId }, { is_linked: false });
  }
  private async token(context: ProviderContext) {
    return await this.client.getToken(
      requireNordigenCredentials(context.credentials),
    );
  }
  private async authorizedIds({ userId, connectionId }: ProviderContext) {
    const authorizations = await this.authorizations.find({
      where: {
        user_id: userId,
        connection_id: connectionId,
        completed_at: Not(IsNull()),
      },
    });
    return [...new Set(authorizations.flatMap((item) => item.account_ids))];
  }
  private async importAccount(
    userId: string,
    token: string,
    remoteId: string,
  ): Promise<string> {
    const [details, balances, remoteTransactions] = await Promise.all([
      this.client.getDetails(token, remoteId),
      this.client.getBalances(token, remoteId),
      this.client.getTransactions(token, remoteId),
    ]);
    const balance = getMoneyBalanceFrom(balances);
    let link = await this.links.findOne({
      where: { user_id: userId, remote_account_id: remoteId },
    });
    let account = link
      ? await this.accounts.findOne({
          where: { user_id: userId, id: link.guallet_account_id },
        })
      : null;
    if (link && !account)
      throw new NotFoundException('Linked account not found');
    const currency =
      balance?.currency.code || details.currency || account?.currency;
    if (!currency)
      throw new BadRequestException('Account currency is unavailable');
    const saved = await this.accounts.manager.transaction(async (manager) => {
      const savedAccount = await manager.save(Account, {
        ...account,
        user_id: userId,
        name:
          details.name || account?.name || details.ownerName || 'Bank account',
        currency,
        balance: balance?.amount ?? account?.balance ?? 0,
        type: account?.type ?? getAccountTypeFrom(details.cashAccountType),
        source: AccountSource.IMPORTED,
        source_name: 'Nordigen',
      });
      const savedLink = await manager.save(NordigenLink, {
        ...link,
        user_id: userId,
        remote_account_id: remoteId,
        guallet_account_id: savedAccount.id,
        is_linked: true,
      });
      return { account: savedAccount, link: savedLink };
    });
    account = saved.account;
    link = saved.link;
    const occurrences = new Map<string, number>();
    const rows = remoteTransactions.map((transaction) => {
      const date = new Date(
        transaction.bookingDateTime ||
          transaction.bookingDate ||
          transaction.valueDate ||
          '',
      );
      if (!Number.isFinite(date.getTime()))
        throw new BadRequestException('Transaction date is invalid');
      const money = Money.fromCurrencyCode({
        amount: Number(transaction.transactionAmount.amount),
        currencyCode: transaction.transactionAmount.currency,
      });
      let id = transaction.transactionId || transaction.entryReference;
      if (!id) {
        const hash = createHash('sha256')
          .update(
            JSON.stringify([
              date.toISOString(),
              transaction.transactionAmount,
              transaction.remittanceInformationUnstructured,
              transaction.debtorAccount,
              transaction.creditorAccount,
            ]),
          )
          .digest('hex');
        const occurrence = (occurrences.get(hash) ?? 0) + 1;
        occurrences.set(hash, occurrence);
        id = `${hash}_${occurrence}`;
      }
      return {
        accountId: account.id,
        externalId: `nordigen:${userId}:${remoteId}:${id}`,
        amount: money.amount,
        currency: money.currency.code,
        date,
        description:
          transaction.remittanceInformationUnstructured ||
          transaction.creditorName ||
          transaction.debtorName ||
          '',
        metadata: { provider: 'nordigen' as const, data: { ...transaction } },
      };
    });
    // Upgrade legacy transaction identifiers only within the owned local account.
    const legacyIds = remoteTransactions
      .map((transaction) => transaction.transactionId)
      .filter(Boolean);
    if (legacyIds.length) {
      const legacy = await this.transactions.find({
        where: { accountId: account.id, externalId: In(legacyIds) },
      });
      for (const row of legacy) {
        if (row.metadata?.provider === 'nordigen') {
          await this.transactions.update(
            { id: row.id, accountId: account.id },
            { externalId: `nordigen:${userId}:${remoteId}:${row.externalId}` },
          );
        }
      }
    }
    const uniqueRows = [
      ...new Map(rows.map((row) => [row.externalId, row])).values(),
    ];
    if (uniqueRows.length)
      await this.transactions.upsert(uniqueRows, {
        conflictPaths: ['externalId'],
        skipUpdateIfNoValuesChanged: true,
      });
    return link.guallet_account_id;
  }
}
