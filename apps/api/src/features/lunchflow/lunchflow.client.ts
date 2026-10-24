import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

const BASE_URL = 'https://lunchflow.app/api/v1';

export type LunchFlowRemoteAccount = {
  id: string | number;
  connection_id?: string | number | null;
  name: string;
  institution_name?: string | null;
  institution_logo?: string | null;
  provider?: string | null;
  currency?: string | null;
  status?: string | null;
};

export type LunchFlowRemoteTransaction = {
  id: string | number;
  amount: number;
  currency: string;
  date: string;
  merchant?: string | null;
  description?: string | null;
  isPending?: boolean;
};

@Injectable()
export class LunchFlowClient {
  constructor(private readonly http: HttpService) {}

  async getAccounts(apiKey: string): Promise<LunchFlowRemoteAccount[]> {
    const response = await this.get<{ accounts: LunchFlowRemoteAccount[] }>(
      '/accounts',
      apiKey,
    );
    return response.accounts;
  }

  async getBalance(
    apiKey: string,
    accountId: string,
  ): Promise<{ amount: number; currency: string }> {
    const response = await this.get<{
      balance: { amount: number; currency: string };
    }>(`/accounts/${encodeURIComponent(accountId)}/balance`, apiKey);
    return response.balance;
  }

  async getTransactions(
    apiKey: string,
    accountId: string,
  ): Promise<LunchFlowRemoteTransaction[]> {
    const response = await this.get<{
      transactions: LunchFlowRemoteTransaction[];
    }>(`/accounts/${encodeURIComponent(accountId)}/transactions`, apiKey);
    return response.transactions;
  }

  private async get<T>(path: string, apiKey: string): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.get<T>(`${BASE_URL}${path}`, {
          headers: { 'x-api-key': apiKey },
          timeout: 15_000,
        }),
      );
      return response.data;
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if (status === 401 || status === 403) {
        throw new UnauthorizedException('Lunch Flow API key was rejected');
      }
      throw new BadGatewayException('Lunch Flow API request failed');
    }
  }
}
