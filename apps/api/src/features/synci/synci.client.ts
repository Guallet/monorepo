import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

const BASE_URL = 'https://api.synci.io/api/v1';

type SynciPage<T> = {
  data: T[];
  meta?: { last_page?: number; current_page?: number };
};

type SynciAccountResource = {
  id: number | string;
  financial_connection_id?: number | string | null;
  financial_connection?: {
    institution?: { name?: string | null; logo?: string | null } | null;
  } | null;
  name?: string | null;
  display_name?: string | null;
  custom_name?: string | null;
  integrator?: string | null;
  currency?: string | null;
  enabled?: boolean;
  cash_balance?: { amount?: number | string; currency?: string } | null;
  balance?: { available?: number | string; cleared?: number | string } | null;
};

export type SynciRemoteAccount = {
  id: string | number;
  connection_id?: string | number | null;
  name: string;
  institution_name?: string | null;
  institution_logo?: string | null;
  provider?: string | null;
  currency?: string | null;
  status?: string | null;
  balance_amount: number;
  balance_currency: string;
};

export type SynciRemoteTransaction = {
  id: string | number;
  amount: number | string;
  currency: string;
  date: string;
  merchant?: string | null;
  description?: string | null;
  isPending?: boolean;
};

type SynciTransactionResource = {
  id: number | string;
  financial_account_id: number | string;
  amount: number | string;
  currency?: string | null;
  booking_date?: string | null;
  value_date?: string | null;
  booked?: boolean | null;
  description?: string | null;
  additional_information?: string | null;
  remittance_information?: {
    unstructured?: string | null;
    structured?: string | null;
  } | null;
  mapped_fields?: {
    date?: string | null;
    payee?: string | null;
    description?: string | null;
  } | null;
};

@Injectable()
export class SynciClient {
  constructor(private readonly http: HttpService) {}

  async getAccounts(apiKey: string): Promise<SynciRemoteAccount[]> {
    const remote = await this.getAllPages<SynciAccountResource>(
      '/finance/accounts',
      apiKey,
    );
    return remote.map((account) => {
      const balance =
        account.cash_balance?.amount ??
        account.balance?.available ??
        account.balance?.cleared ??
        0;
      return {
        id: account.id,
        connection_id: account.financial_connection_id,
        name:
          account.custom_name ||
          account.display_name ||
          account.name ||
          `Synci account ${account.id}`,
        institution_name:
          account.financial_connection?.institution?.name ?? null,
        institution_logo:
          account.financial_connection?.institution?.logo ?? null,
        provider: account.integrator ?? null,
        currency: account.cash_balance?.currency ?? account.currency ?? null,
        status: account.enabled === false ? 'INACTIVE' : 'ACTIVE',
        balance_amount: Number(balance),
        balance_currency:
          account.cash_balance?.currency ?? account.currency ?? '',
      };
    });
  }

  async getBalance(
    apiKey: string,
    accountId: string,
  ): Promise<{ amount: number; currency: string }> {
    const account = (await this.getAccounts(apiKey)).find(
      (item) => String(item.id) === accountId,
    );
    if (!account) throw new BadGatewayException('Synci account was not found');
    return {
      amount: account.balance_amount,
      currency: account.balance_currency,
    };
  }

  async getTransactions(
    apiKey: string,
    accountId: string,
  ): Promise<SynciRemoteTransaction[]> {
    const remote = await this.getAllPages<SynciTransactionResource>(
      '/finance/transactions',
      apiKey,
      { 'filter[financial_account_id]': accountId, 'page[size]': '100' },
    );
    return remote.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency ?? '',
      date:
        transaction.mapped_fields?.date ??
        transaction.booking_date ??
        transaction.value_date ??
        '',
      merchant: transaction.mapped_fields?.payee ?? null,
      description:
        transaction.mapped_fields?.description ??
        transaction.description ??
        transaction.remittance_information?.unstructured ??
        transaction.remittance_information?.structured ??
        transaction.additional_information ??
        null,
      isPending: transaction.booked === false,
    }));
  }

  private async getAllPages<T>(
    path: string,
    apiKey: string,
    params: Record<string, string> = {},
  ): Promise<T[]> {
    const values: T[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const response = await this.get<SynciPage<T>>(path, apiKey, {
        ...params,
        'page[number]': String(page),
        'page[size]': params['page[size]'] ?? '100',
      });
      values.push(...(response.data ?? []));
      lastPage = response.meta?.last_page ?? page;
      page += 1;
    } while (page <= lastPage);
    return values;
  }

  private async get<T>(
    path: string,
    apiKey: string,
    params: Record<string, string>,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.get<T>(`${BASE_URL}${path}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
          params,
          timeout: 15_000,
        }),
      );
      return response.data;
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if (status === 401 || status === 403) {
        throw new UnauthorizedException('Synci API token was rejected');
      }
      throw new BadGatewayException('Synci API request failed');
    }
  }
}
