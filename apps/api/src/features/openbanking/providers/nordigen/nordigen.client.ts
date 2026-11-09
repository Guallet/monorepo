import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import type {
  NordigenCredentials,
  NordigenTokenResponse,
  NordigenInstitution,
  NordigenAuthorizationRequest,
  NordigenAuthorizationResponse,
  NordigenAuthorization,
  NordigenAgreement,
  NordigenAccountDetailsResponse,
  NordigenAccountBalancesResponse,
  NordigenTransactionsResponse,
} from './types';

const BASE_URL = 'https://bankaccountdata.gocardless.com/api/v2';

@Injectable()
export class NordigenClient {
  constructor(private readonly http: HttpService) {}

  async getToken(credentials: NordigenCredentials): Promise<string> {
    const token = await this.request<NordigenTokenResponse>(
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
    return await this.request<NordigenInstitution[]>(
      'GET',
      `/institutions/?country=${encodeURIComponent(country)}`,
      token,
    );
  }

  async authorize(
    token: string,
    institutionId: string,
    redirect: string,
    reference: string,
  ) {
    const data: NordigenAuthorizationRequest = {
      institution_id: institutionId,
      redirect,
      reference,
    };
    return await this.request<NordigenAuthorizationResponse>(
      'POST',
      '/requisitions/',
      token,
      data,
    );
  }

  async getAuthorization(token: string, id: string) {
    return await this.request<NordigenAuthorization>(
      'GET',
      `/requisitions/${encodeURIComponent(id)}/`,
      token,
    );
  }

  async getAgreement(token: string, id: string) {
    return await this.request<NordigenAgreement>(
      'GET',
      `/agreements/enduser/${encodeURIComponent(id)}/`,
      token,
    );
  }

  async getDetails(token: string, id: string) {
    return await this.request<NordigenAccountDetailsResponse>(
      'GET',
      `/accounts/${encodeURIComponent(id)}/details/`,
      token,
    );
  }

  async getBalances(token: string, id: string) {
    return (
      await this.request<NordigenAccountBalancesResponse>(
        'GET',
        `/accounts/${encodeURIComponent(id)}/balances/`,
        token,
      )
    ).balances;
  }

  async getTransactions(token: string, id: string) {
    return (
      await this.request<NordigenTransactionsResponse>(
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
