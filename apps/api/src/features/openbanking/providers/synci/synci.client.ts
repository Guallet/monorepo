import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { connectionStatusFromProvider } from '../../models/bank-connection-state.model';
import type {
  SynciConnectionResource,
  SynciPage,
  SynciAccountResource,
  SynciRemoteAccount,
  SynciRemoteTransaction,
  SynciTransactionResource,
} from './types';

const BASE_URL = 'https://api.synci.io/api/v1';

@Injectable()
export class SynciClient {
  constructor(private readonly http: HttpService) {}

  async getAccounts(apiKey: string): Promise<SynciRemoteAccount[]> {
    const remote = await this.getAllPages<SynciAccountResource>(
      '/finance/accounts',
      apiKey,
      { include: 'financial_connection.institution' },
    );
    const connectionIds = [
      ...new Set(
        remote.flatMap((account) =>
          account.financial_connection_id == null
            ? []
            : [String(account.financial_connection_id)],
        ),
      ),
    ];
    const connections = new Map(
      await Promise.all(
        connectionIds.map(async (id) => {
          try {
            const response = await this.get<{ data: SynciConnectionResource }>(
              `/finance/connections/${encodeURIComponent(id)}`,
              apiKey,
              {},
            );
            return [id, response.data] as const;
          } catch {
            return [id, null] as const;
          }
        }),
      ),
    );
    return remote.map((account) => {
      const connection =
        account.financial_connection_id == null
          ? undefined
          : connections.get(String(account.financial_connection_id));
      let connectionStatus = connectionStatusFromProvider(connection?.status);
      const hasError =
        connection === null ||
        account.enabled === false ||
        ['FAILING', 'DEAD'].includes(connection?.health?.status ?? '');
      if (hasError && connectionStatus !== 'expired') {
        connectionStatus = 'connectionError';
      }
      const balance =
        account.cash_balance?.amount ??
        account.balance?.available ??
        account.balance?.cleared ??
        0;
      return {
        raw: account,
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
        connectionStatus,
        connectionExpiresAt: connection?.consent_expires_at,
        lastRefresh: connection?.activated_at,
        balance_amount: Number(balance),
        balance_currency:
          account.cash_balance?.currency ?? account.currency ?? '',
      };
    });
  }

  getBalance(account: SynciRemoteAccount): {
    amount: number;
    currency: string;
  } {
    return {
      amount: account.balance_amount,
      currency: account.balance_currency,
    };
  }

  async getTransactions(
    apiKey: string,
    accountId: string,
    from?: string,
    to?: string,
  ): Promise<SynciRemoteTransaction[]> {
    const params: Record<string, string> = {
      'filter[financial_account_id]': accountId,
      'page[size]': '100',
    };
    if (from) params['filter[booking_date_after]'] = from;
    if (to) params['filter[booking_date_before]'] = to;
    const remote = await this.getAllPages<SynciTransactionResource>(
      '/finance/transactions',
      apiKey,
      params,
    );
    return remote.map((transaction) => {
      const date = [
        transaction.mapped_fields?.date,
        transaction.booking_date,
        transaction.value_date,
        transaction.booking_datetime,
        transaction.value_datetime,
      ].find((value) => value && !Number.isNaN(new Date(value).getTime()));
      if (!date) {
        throw new BadGatewayException('Synci transaction has no valid date');
      }
      return {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency ?? '',
        date,
        merchant: transaction.mapped_fields?.payee ?? null,
        description:
          transaction.mapped_fields?.description ??
          transaction.description ??
          transaction.remittance_information?.unstructured ??
          transaction.remittance_information?.structured ??
          transaction.additional_information ??
          null,
        isPending: transaction.booked === false,
      };
    });
  }

  private async getAllPages<T>(
    path: string,
    apiKey: string,
    params: Record<string, string> = {},
  ): Promise<T[]> {
    const values: T[] = [];
    let page = 1;
    let lastPage: number;
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
