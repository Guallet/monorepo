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
} from './dto/nordige-account.dto';
import {
  NordigenTransactionDto,
  NordigenTransactionsDto,
} from './dto/nordigen-transaction.dto';
import { NordigenToken } from './entities/nordigen-token.entity';
import { NordigenTokenDto } from './dto/nordigen-token.dto';
import { NordigenRepository } from './nordigen.repository';
import { NordigenRequisitionDto } from './dto/nordigen-requisition.dto';

@Injectable()
export class NordigenService {
  //   private readonly BASE_URL = 'https://ob.nordigen.com';
  private readonly BASE_URL = 'https://bankaccountdata.gocardless.com';

  private readonly logger = new Logger(NordigenService.name);

  constructor(
    private readonly httpService: HttpService,
    private repository: NordigenRepository,
  ) {}

  //#region token
  private async getAccessToken(): Promise<string> {
    const token = await this.getToken();
    return token.access;
  }

  private async getToken(): Promise<NordigenToken> {
    const existingToken = await this.repository.getToken();

    if (existingToken) {
      if (this.isTokenExpired(existingToken)) {
        if (existingToken.refresh_expires_on <= new Date()) {
          // Expired too long ago. Get a new one
          this.logger.log(
            'Refresh token expired. Deleting token and getting a new one',
          );
          await this.repository.deleteToken(existingToken);
          return await this.getNewToken();
        } else {
          // Refresh token
          this.logger.log('Nordigen token is expired. Refresh token');
          return await this.refreshToken(
            existingToken.id,
            existingToken.refresh,
          );
        }
      } else {
        return existingToken;
      }
    } else {
      // Get a new one
      this.logger.log('No existing token. Getting a new one');
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

    this.logger.debug('Saving new token');
    return await this.repository.createToken(
      dto.access,
      access_expiration_date,
      dto.refresh,
      refresh_expiration_date,
    );
  }

  private async refreshToken(
    tokenId: number,
    refresh_token: string,
  ): Promise<NordigenToken> {
    const url = `${this.BASE_URL}/api/v2/token/refresh/`;

    const response = await firstValueFrom(
      this.httpService.post<NordigenTokenDto>(url, {
        refresh: refresh_token,
      }),
    );

    // Save new token
    const dto = response.data;
    this.logger.debug('Updating token');
    return await this.repository.updateToken(
      tokenId,
      dto.access,
      dto.access_expires,
    );
  }

  private isTokenExpired(token: NordigenToken): boolean {
    const now = new Date();
    return token.access_expires_on <= now;
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
      return response.data;
    } catch (response) {
      this.logger.error(`Error making Nordigen GET request to ${path}`);
      this.handleHttpStatusCodes(response, true);
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

  async makePostRequest<T>(path: string, payload: any): Promise<T> {
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

      return response.data;
    } catch (response) {
      this.logger.error(
        `Error making POST request to ${path}. Payload ${JSON.stringify(
          payload,
          null,
          4,
        )}`,
      );
      this.handleHttpStatusCodes(response, true);
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
      return response.data;
    } catch (response) {
      this.logger.error(`Error making Nordigen GET request to ${path}`);
      this.handleHttpStatusCodes(response, true);
    }
  }
  //#endregion

  //# region requisitions
  async createRequisition(
    institution_id: string,
    redirect_url: string,
  ): Promise<any> {
    const path = `/api/v2/requisitions/`;

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

      return response;
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

    const response = await this.makeDeleteRequest<DeleteRequisitionResponse>(
      path,
    );
    return response;
  }

  //#endregion
}

export type DeleteRequisitionResponse = {
  summary: string;
  detail: string;
};
