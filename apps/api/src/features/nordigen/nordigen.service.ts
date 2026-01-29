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
import { NordigenInstitutionDto } from './dto/nordigen-institution.dto';
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
import { NordigenRequisitionDto } from './dto/nordigen-requisition.dto';

interface NordigenToken {
  id: number;
  access: string;
  refresh: string;
  access_expires_on: Date;
  refresh_expires_on: Date;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class NordigenService {
  //   private readonly BASE_URL = 'https://ob.nordigen.com';
  private readonly BASE_URL = 'https://bankaccountdata.gocardless.com';

  private readonly logger = new Logger(NordigenService.name);
  private inMemoryToken: NordigenToken | null = null;

  constructor(private readonly httpService: HttpService) { }

  //#region token
  private async getAccessToken(): Promise<string> {
    const token = await this.getToken();
    return token.access;
  }

  private async getToken(): Promise<NordigenToken> {
    if (this.inMemoryToken) {
      if (this.isTokenExpired(this.inMemoryToken)) {
        if (this.inMemoryToken.refresh_expires_on <= new Date()) {
          // Expired too long ago. Get a new one
          this.logger.log(
            'Refresh token expired. Clearing in-memory token and getting a new one',
          );
          this.inMemoryToken = null;
          return await this.getNewToken();
        } else {
          // Refresh token
          this.logger.log('Nordigen token is expired. Refresh token');
          return await this.refreshToken(this.inMemoryToken.refresh);
        }
      } else {
        return this.inMemoryToken;
      }
    } else {
      // Get a new one
      this.logger.warn('No existing token. Getting a new one');
      return await this.getNewToken();
    }
  }

  private async getNewToken(): Promise<NordigenToken> {
    this.logger.debug('Getting new Nordigen token');
    const url = `${this.BASE_URL}/api/v2/token/new/`;

    const response = await firstValueFrom(
      this.httpService.post<NordigenTokenDto>(
        url,
        {
          secret_id: process.env.NORDIGEN_SECRET_ID,
          secret_key: process.env.NORDIGEN_SECRET_KEY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      ),
    );

    // Save new token
    const dto = response.data;

    // Access date
    const access_expiration_date = new Date();
    access_expiration_date.setSeconds(
      access_expiration_date.getSeconds() + dto.access_expires,
    );

    // Refresh date
    const refresh_expiration_date = new Date();
    refresh_expiration_date.setSeconds(
      refresh_expiration_date.getSeconds() + dto.refresh_expires,
    );

    this.logger.debug('Saving token in memory');
    this.inMemoryToken = {
      id: 0, // In-memory token doesn't need a DB id
      access: dto.access,
      access_expires_on: access_expiration_date,
      refresh: dto.refresh,
      refresh_expires_on: refresh_expiration_date,
      created_at: new Date(),
      updated_at: new Date(),
    } as NordigenToken;

    return this.inMemoryToken;
  }

  private async refreshToken(refresh_token: string): Promise<NordigenToken> {
    const url = `${this.BASE_URL}/api/v2/token/refresh/`;

    const response = await firstValueFrom(
      this.httpService.post<NordigenTokenDto>(url, {
        refresh: refresh_token,
      }),
    );

    // Save new token
    const dto = response.data;
    this.logger.debug('Updating token in memory');

    if (this.inMemoryToken) {
      const expiration_date = new Date();
      expiration_date.setSeconds(
        expiration_date.getSeconds() + dto.access_expires,
      );

      this.inMemoryToken.access = dto.access;
      this.inMemoryToken.access_expires_on = expiration_date;
      this.inMemoryToken.updated_at = new Date();

      return this.inMemoryToken;
    }

    throw new InternalServerErrorException('Token vanished during refresh');
  }

  private isTokenExpired(token: NordigenToken): boolean {
    const now = new Date();
    return token.access_expires_on < now;
  }

  //#endregion

  //#region institutions
  async getInstitutions(countyCode: string): Promise<NordigenInstitutionDto[]> {
    return await this.makeGetRequest<NordigenInstitutionDto[]>(
      `/api/v2/institutions/?country=${countyCode}`,
    );
  }

  async getInstitution(institutionId: string): Promise<NordigenInstitutionDto> {
    return await this.makeGetRequest<NordigenInstitutionDto>(
      `/api/v2/institutions/${institutionId}`,
    );
  }
  //#endregion

  //#region accounts
  async getAccountMetadata(
    account_id: string,
  ): Promise<NordigenAccountMetadataDto> {
    return await this.makeGetRequest<NordigenAccountMetadataDto>(
      `/api/v2/accounts/${account_id}/`,
    );
  }

  async getAccountDetails(account_id: string): Promise<NordigenAccountDto> {
    const response = await this.makeGetRequest<NordigenAccountDetailsDto>(
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
    account_id: string,
  ): Promise<NordigenAccountBalanceDto[]> {
    const response = await this.makeGetRequest<NordigenAccountBalancesDto>(
      `/api/v2/accounts/${account_id}/balances/`,
    );
    return response.balances;
  }

  async getAccountTransactions(
    account_id: string,
  ): Promise<NordigenTransactionDto[]> {
    this.logger.debug(
      `Getting Nordigen transactions for account ${account_id}`,
    );
    const response = await this.makeGetRequest<NordigenTransactionsDto>(
      `/api/v2/accounts/${account_id}/transactions/`,
    );
    // We are not interested in the pending transactions yet. Better work only with booked for now
    return response.transactions.booked;
  }
  //#endregion

  //#region HTTP helpers
  async makeGetRequest<T>(path: string): Promise<T> {
    const url = `${this.BASE_URL}${path}`;
    const token = await this.getAccessToken();

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

  async makePostRequest<T>(path: string, payload: unknown): Promise<T> {
    const url = `${this.BASE_URL}${path}`;
    const token = await this.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService
          .post(url, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data;
    } catch (error_) {
      this.logger.error(
        `Error making POST request to ${path}. Payload ${JSON.stringify(
          payload,
          null,
          4,
        )}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.handleHttpStatusCodes(error_, true);
      throw new InternalServerErrorException();
    }
  }

  async makeDeleteRequest<T>(path: string): Promise<T> {
    const url = `${this.BASE_URL}${path}`;
    const token = await this.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService
          .delete(url, {
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
      this.logger.error(`Error making Nordigen GET request to ${path}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.handleHttpStatusCodes(error_, true);
      throw error_;
    }
  }
  //#endregion

  //# region requisitions
  async createRequisition(
    institution_id: string,
    redirect_url: string,
  ): Promise<NordigenRequisitionDto> {
    const path = `/api/v2/requisitions/`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.makePostRequest<any>(path, {
      redirect: redirect_url,
      institution_id: institution_id,
    });

    // Weird error from nordigen where it returns the GET object instead of the POST one
    if (response.count) {
      this.logger.error('Error: Incorrect response format from Nordigen');
      throw new InternalServerErrorException(
        'Error getting a single item from PSD2 Provider',
      );
    } else {
      this.logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);

      return response as NordigenRequisitionDto;
    }
  }

  async getRequisition(
    requisition_id: string,
  ): Promise<NordigenRequisitionDto> {
    this.logger.debug(`Getting the requisition id ${requisition_id} from API`);
    const path = `/api/v2/requisitions/${requisition_id}`;

    const response = await this.makeGetRequest<NordigenRequisitionDto>(path);
    return response;
  }

  async deleteRequisition(
    requisition_id: string,
  ): Promise<DeleteRequisitionResponse> {
    this.logger.debug(`Getting the requisition id ${requisition_id} from API`);
    const path = `/api/v2/requisitions/${requisition_id}`;

    const response =
      await this.makeDeleteRequest<DeleteRequisitionResponse>(path);
    return response;
  }

  //#endregion
}

export type DeleteRequisitionResponse = {
  summary: string;
  detail: string;
};
