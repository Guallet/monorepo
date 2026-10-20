import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotImplementedException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

const BASE_URL = 'https://api.banksync.io/v1';
const REQUEST_INTERVAL_MS = 7_000;

export type BankSyncBank = {
  id: string;
  name: string;
  connectionStatus?: { connected?: boolean };
};

export type BankSyncRemoteAccount = {
  id?: string;
  accountId?: string;
  name?: string;
  accountName?: string;
  type?: string;
  currency?: string;
  balance?: number | string | null;
  currentBalance?: number | string | null;
};

export type BankSyncRemoteTransaction = {
  id: string;
  date: string;
  amount: number | string;
  currency?: string | null;
  description?: string | null;
  name?: string | null;
  merchant?: string | null;
  pending?: boolean;
  pendingTransactionId?: string | null;
};

type BankSyncResponse<T> = {
  success: boolean;
  data: T;
  modified?: T;
  removed?: string[];
  meta?: { cursor?: string | null; hasMore?: boolean };
};

type BankSyncRemoteBalance = {
  balance?: number | string;
  currentBalance?: number | string;
  amount?: number | string;
  currency?: string;
};

@Injectable()
export class BankSyncClient {
  private readonly nextRequestAtByUser = new Map<string, number>();

  constructor(private readonly http: HttpService) {}

  async getBanks(apiKey: string, userId: string): Promise<BankSyncBank[]> {
    return (await this.get<{ data: BankSyncBank[] }>('/banks', apiKey, userId))
      .data;
  }

  async getAccounts(
    apiKey: string,
    bankId: string,
    userId: string,
  ): Promise<BankSyncRemoteAccount[]> {
    const response = await this.get<{ data: BankSyncRemoteAccount[] }>(
      `/banks/${encodeURIComponent(bankId)}/accounts`,
      apiKey,
      userId,
    );
    return response.data;
  }

  async getTransactions(
    apiKey: string,
    bankId: string,
    accountId: string,
    from: string,
    to: string,
    userId: string,
  ): Promise<{
    transactions: BankSyncRemoteTransaction[];
    removedIds: string[];
  }> {
    const transactions: BankSyncRemoteTransaction[] = [];
    const removedIds = new Set<string>();
    let cursor: string | undefined;
    for (let page = 0; page < 100; page += 1) {
      const query = new URLSearchParams({ from, to });
      if (cursor) query.set('cursor', cursor);
      const response = await this.get<
        BankSyncResponse<BankSyncRemoteTransaction[]>
      >(
        `/banks/${encodeURIComponent(bankId)}/accounts/${encodeURIComponent(accountId)}/transactions?${query.toString()}`,
        apiKey,
        userId,
      );
      transactions.push(...response.data);
      for (const transaction of response.modified ?? []) {
        transactions.push(transaction);
      }
      for (const removedId of response.removed ?? []) {
        removedIds.add(removedId);
      }
      if (!response.meta?.hasMore) {
        const uniqueTransactions = new Map(
          transactions.map((transaction) => [transaction.id, transaction]),
        );
        return {
          transactions: [...uniqueTransactions.values()],
          removedIds: [...removedIds],
        };
      }
      if (!response.meta.cursor || response.meta.cursor === cursor) {
        throw new BadGatewayException(
          'BankSync returned an invalid page cursor',
        );
      }
      cursor = response.meta.cursor;
    }
    throw new BadGatewayException(
      'BankSync transaction history has too many pages',
    );
  }

  async getBalances(
    apiKey: string,
    bankId: string,
    accountId: string,
    userId: string,
  ): Promise<{ amount: number; currency: string } | null> {
    let response: { data: BankSyncRemoteBalance | BankSyncRemoteBalance[] };
    try {
      response = await this.get<{
        data: BankSyncRemoteBalance | BankSyncRemoteBalance[];
      }>(
        `/banks/${encodeURIComponent(bankId)}/accounts/${encodeURIComponent(accountId)}/balances`,
        apiKey,
        userId,
      );
    } catch (error) {
      if (error instanceof NotImplementedException) return null;
      throw error;
    }
    const balances = Array.isArray(response.data)
      ? response.data
      : [response.data];
    const balance = balances.find(
      (item) =>
        item.balance !== undefined ||
        item.currentBalance !== undefined ||
        item.amount !== undefined,
    );
    const amount =
      balance?.balance ?? balance?.currentBalance ?? balance?.amount;
    if (amount === undefined || !balance?.currency) return null;
    return { amount: Number(amount), currency: balance.currency };
  }

  private async get<T>(
    path: string,
    apiKey: string,
    userId: string,
  ): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        await this.pace(userId); // NOSONAR -- requests must obey BankSync pacing
        const response = await firstValueFrom(
          this.http.get<T>(`${BASE_URL}${path}`, {
            headers: { 'X-API-Key': apiKey },
            timeout: 20_000,
          }),
        );
        this.assertSuccessfulResponse(response.data);
        return response.data;
      } catch (error) {
        if (await this.handleRequestError(error, attempt)) continue;
      }
    }
    throw new BadGatewayException('BankSync rate limit was exceeded');
  }

  private assertSuccessfulResponse(value: unknown): void {
    const payload = value as { success?: boolean } | null;
    if (payload?.success === false) {
      throw new BadGatewayException(
        'BankSync returned an unsuccessful response',
      );
    }
  }

  private async handleRequestError(
    error: unknown,
    attempt: number,
  ): Promise<boolean> {
    if (error instanceof BadGatewayException) throw error;
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    if (status === 429 && attempt < 3) {
      await this.waitForRateLimit(axiosError);
      return true;
    }
    if (status === 401) {
      throw new UnauthorizedException('BankSync API key was rejected');
    }
    if (status === 403) {
      throw new ForbiddenException(
        'BankSync requires REST API access and the banks:read scope',
      );
    }
    if (status === 400) {
      throw new BadRequestException('BankSync rejected the request');
    }
    if (status === 501) {
      throw new NotImplementedException(
        'BankSync does not provide balances for this account',
      );
    }
    if (status === 409 || status === 423 || status === 425 || status === 503) {
      throw new ServiceUnavailableException(
        'BankSync bank connection needs attention; reconnect it in BankSync',
      );
    }
    throw new BadGatewayException('BankSync API request failed');
  }

  private async waitForRateLimit(error: AxiosError): Promise<void> {
    const retryAfter = Number(error.response?.headers['retry-after']);
    const waitMs = Number.isFinite(retryAfter)
      ? Math.min(Math.max(retryAfter, 1), 120) * 1000
      : 60_000;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  private async pace(userId: string): Promise<void> {
    const now = Date.now();
    const nextRequestAt = Math.max(
      now,
      this.nextRequestAtByUser.get(userId) ?? now,
    );
    this.nextRequestAtByUser.set(userId, nextRequestAt + REQUEST_INTERVAL_MS);
    if (nextRequestAt > now) {
      await new Promise((resolve) => setTimeout(resolve, nextRequestAt - now));
    }
  }
}
