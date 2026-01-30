import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import {
  NordigenAccountBalanceDto,
  NordigenAccountBalancesDto,
  NordigenAccountDetailsDto,
  NordigenAccountDto,
  NordigenAccountMetadataDto,
} from './dto/nordigen-account.dto';
import {
  NordigenTransactionDto,
  NordigenTransactionsDto,
} from './dto/nordigen-transaction.dto';
import { NordigenTokenDto } from './dto/nordigen-token.dto';

export interface NordigenCredentials {
  secretId: string;
  secretKey: string;
}

/**
 * Service for making Nordigen API calls with user-specific credentials.
 * This service does NOT store access tokens in the database.
 * A fresh access token is obtained for each sync operation.
 */
@Injectable()
export class NordigenUserService {
  private readonly BASE_URL = 'https://bankaccountdata.gocardless.com';
  private readonly logger = new Logger(NordigenUserService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Gets a new access token using user-provided credentials.
   * This token is NOT stored in the database - it's only used for the current operation.
   */
  async getAccessToken(credentials: NordigenCredentials): Promise<string> {
    this.logger.debug(
      'Getting new Nordigen access token with user credentials',
    );
    const url = `${this.BASE_URL}/api/v2/token/new/`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<NordigenTokenDto>(
          url,
          {
            secret_id: credentials.secretId,
            secret_key: credentials.secretKey,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        ),
      );

      return response.data.access;
    } catch (error) {
      this.logger.error('Failed to get Nordigen access token', error);
      throw new UnauthorizedException(
        'Invalid Nordigen credentials. Please check your secret ID and secret key.',
      );
    }
  }

  //#region accounts
  async getAccountMetadata(
    credentials: NordigenCredentials,
    account_id: string,
  ): Promise<NordigenAccountMetadataDto> {
    return await this.makeGetRequest<NordigenAccountMetadataDto>(
      credentials,
      `/api/v2/accounts/${account_id}/`,
    );
  }

  async getAccountDetails(
    credentials: NordigenCredentials,
    account_id: string,
  ): Promise<NordigenAccountDto> {
    const response = await this.makeGetRequest<NordigenAccountDetailsDto>(
      credentials,
      `/api/v2/accounts/${account_id}/details/`,
    );
    this.logger.log(
      `Getting Nordigen account details for ${account_id}. Response: ${JSON.stringify(
        response,
        null,
        4,
      )}`,
    );
    return response.account;
  }

  async getAccountBalance(
    credentials: NordigenCredentials,
    account_id: string,
  ): Promise<NordigenAccountBalanceDto[]> {
    const response = await this.makeGetRequest<NordigenAccountBalancesDto>(
      credentials,
      `/api/v2/accounts/${account_id}/balances/`,
    );
    return response.balances;
  }

  async getAccountTransactions(
    credentials: NordigenCredentials,
    account_id: string,
  ): Promise<NordigenTransactionDto[]> {
    this.logger.debug(
      `Getting Nordigen transactions for account ${account_id}`,
    );
    const response = await this.makeGetRequest<NordigenTransactionsDto>(
      credentials,
      `/api/v2/accounts/${account_id}/transactions/`,
    );
    // We are not interested in the pending transactions yet. Better work only with booked for now
    return response.transactions.booked;
  }
  //#endregion

  //#region HTTP helpers
  private async makeGetRequest<T>(
    credentials: NordigenCredentials,
    path: string,
  ): Promise<T> {
    const url = `${this.BASE_URL}${path}`;
    const token = await this.getAccessToken(credentials);

    try {
      const response = await firstValueFrom(
        this.httpService
          .get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          })
          .pipe(
            catchError((e) => {
              throw e.response;
            }),
          ),
      );
      // Search for common HTTP status codes
      this.handleHttpStatusCodes(response);

      // If no exception thrown in the step before, then return the data
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data;
    } catch (error_) {
      this.logger.error(
        `Error making Nordigen GET request to ${path}. Error: ${typeof error_}}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.handleHttpStatusCodes(error_, true);
      throw new InternalServerErrorException();
    }
  }

  private handleHttpStatusCodes(response: AxiosResponse, forceHandle = false) {
    switch (response.status) {
      case 400:
        throw new BadRequestException();
      case 401:
        throw new UnauthorizedException();
      case 403:
        throw new ForbiddenException();
      case 404:
        throw new NotFoundException();
    }

    // If forceHandle true, then throw an exception since this has to be handled here
    if (forceHandle) {
      this.logger.error(`Error making request to Nordigen`, {
        status: response.status,
        error: response.data,
      });
      throw new InternalServerErrorException();
    }
  }
  //#endregion
}
