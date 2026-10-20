import { HttpService } from '@nestjs/axios';
import { createHash } from 'node:crypto';
import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
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
};

type BankSyncResponse<T> = {
  success: boolean;
  data: T;
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
  private readonly nextRequestAtByKey = new Map<string, number>();

  constructor(private readonly http: HttpService) {}

  async getBanks(apiKey: string): Promise<BankSyncBank[]> {
    return (await this.get<{ data: BankSyncBank[] }>('/banks', apiKey)).data;
  }

  async getAccounts(
    apiKey: string,
    bankId: string,
  ): Promise<BankSyncRemoteAccount[]> {
    const response = await this.get<{ data: BankSyncRemoteAccount[] }>(
      `/banks/${encodeURIComponent(bankId)}/accounts`,
      apiKey,
    );
    return response.data;
  }

  async getTransactions(
    apiKey: string,
    bankId: string,
    accountId: string,
    from: string,
    to: string,
  ): Promise<BankSyncRemoteTransaction[]> {
    const transactions: BankSyncRemoteTransaction[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 100; page += 1) {
      const query = new URLSearchParams({ from, to });
      if (cursor) query.set('cursor', cursor);
      const response = await this.get<
        BankSyncResponse<BankSyncRemoteTransaction[]>
      >(
        `/banks/${encodeURIComponent(bankId)}/accounts/${encodeURIComponent(accountId)}/transactions?${query.toString()}`,
        apiKey,
      );
      transactions.push(...response.data);
      if (!response.meta?.hasMore) return transactions;
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
  ): Promise<{ amount: number; currency: string } | null> {
    const response = await this.get<{
      data: BankSyncRemoteBalance | BankSyncRemoteBalance[];
    }>(
      `/banks/${encodeURIComponent(bankId)}/accounts/${encodeURIComponent(accountId)}/balances`,
      apiKey,
    );
    const balances = Array.isArray(response.data)
      ? response.data
      : [response.data];
    const balance = balances.find(
      (item) => item.balance !== undefined || item.amount !== undefined,
    );
    const amount =
      balance?.balance ?? balance?.currentBalance ?? balance?.amount;
    if (amount === undefined || !balance?.currency) return null;
    return { amount: Number(amount), currency: balance.currency };
  }

  private async get<T>(path: string, apiKey: string): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        await this.pace(apiKey);
        const response = await firstValueFrom(
          this.http.get<T>(`${BASE_URL}${path}`, {
            headers: { 'X-API-Key': apiKey },
            timeout: 20_000,
          }),
        );
        const payload = response.data as { success?: boolean; error?: string };
        if (payload?.success === false) {
          throw new BadGatewayException(
            'BankSync returned an unsuccessful response',
          );
        }
        return response.data;
      } catch (error) {
        if (error instanceof BadGatewayException) throw error;
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        if (status === 429 && attempt < 3) {
          const retryAfter = Number(
            axiosError.response?.headers['retry-after'],
          );
          const waitMs = Number.isFinite(retryAfter)
            ? Math.min(Math.max(retryAfter, 1), 120) * 1000
            : 60_000;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
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
        if (
          status === 409 ||
          status === 423 ||
          status === 425 ||
          status === 503
        ) {
          throw new ServiceUnavailableException(
            'BankSync bank connection needs attention; reconnect it in BankSync',
          );
        }
        throw new BadGatewayException('BankSync API request failed');
      }
    }
    throw new BadGatewayException('BankSync rate limit was exceeded');
  }

  private async pace(apiKey: string): Promise<void> {
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const now = Date.now();
    const nextRequestAt = Math.max(
      now,
      this.nextRequestAtByKey.get(keyHash) ?? now,
    );
    this.nextRequestAtByKey.set(keyHash, nextRequestAt + REQUEST_INTERVAL_MS);
    if (nextRequestAt > now) {
      await new Promise((resolve) => setTimeout(resolve, nextRequestAt - now));
    }
  }
}
