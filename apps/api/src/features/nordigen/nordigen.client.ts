import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  NordigenAccountDetailsDto,
  NordigenAccountBalancesDto,
} from './dto/nordigen-account.dto';
import { NordigenTransactionsDto } from './dto/nordigen-transaction.dto';

const BASE_URL = 'https://bankaccountdata.gocardless.com/api/v2';
@Injectable()
export class NordigenClient {
  constructor(private readonly http: HttpService) {}

  async getToken(credentials: {
    secretId: string;
    secretKey: string;
  }): Promise<string> {
    const token = await this.request<{ access: string }>(
      'POST',
      '/token/new/',
      undefined,
      {
        secret_id: credentials.secretId,
        secret_key: credentials.secretKey,
      },
    );
    return token.access;
  }
  async getInstitutions(token: string, country: string) {
    return await this.request<
      Array<{ id: string; name: string; logo: string }>
    >('GET', `/institutions/?country=${encodeURIComponent(country)}`, token);
  }
  async authorize(
    token: string,
    institutionId: string,
    redirect: string,
    reference: string,
  ) {
    return await this.request<{ id: string; link: string }>(
      'POST',
      '/requisitions/',
      token,
      {
        institution_id: institutionId,
        redirect,
        reference,
      },
    );
  }
  async getAuthorization(token: string, id: string) {
    return await this.request<{ status: string; accounts: string[] }>(
      'GET',
      `/requisitions/${encodeURIComponent(id)}/`,
      token,
    );
  }
  async getDetails(token: string, id: string) {
    return (
      await this.request<NordigenAccountDetailsDto>(
        'GET',
        `/accounts/${encodeURIComponent(id)}/details/`,
        token,
      )
    ).account;
  }
  async getBalances(token: string, id: string) {
    return (
      await this.request<NordigenAccountBalancesDto>(
        'GET',
        `/accounts/${encodeURIComponent(id)}/balances/`,
        token,
      )
    ).balances;
  }
  async getTransactions(token: string, id: string) {
    return (
      await this.request<NordigenTransactionsDto>(
        'GET',
        `/accounts/${encodeURIComponent(id)}/transactions/`,
        token,
      )
    ).transactions.booked;
  }
  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    token?: string,
    data?: unknown,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.request<T>({
          url: `${BASE_URL}${path}`,
          method,
          data,
          timeout: 30_000,
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }),
      );
      return response.data;
    } catch (error) {
      // Never propagate Axios errors containing credentials or bank data.
      if (isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403)
          throw new UnauthorizedException('Nordigen credentials were rejected');
        if (error.response?.status === 400)
          throw new BadRequestException('Nordigen rejected the request');
      }
      throw new BadGatewayException('Nordigen request failed');
    }
  }
}
