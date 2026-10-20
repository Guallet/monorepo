import { HttpService } from '@nestjs/axios';
import { isAxiosError, type AxiosResponse } from 'axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
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
import { NordigenToken } from './entities/nordigen-token.entity';
import { NordigenTokenDto } from './dto/nordigen-token.dto';
import { NordigenRepository } from './nordigen.repository';
import { NordigenRequisitionDto } from './dto/nordigen-requisition.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenCredentials } from './entities/nordigen-credentials.entity';
import { AiCredentialEncryptionService } from 'src/features/ai/ai-credential-encryption.service';

@Injectable()
export class NordigenService {
  //   private readonly BASE_URL = 'https://ob.nordigen.com';
  private readonly BASE_URL = 'https://bankaccountdata.gocardless.com';

  private readonly logger = new Logger(NordigenService.name);

  constructor(
    private readonly httpService: HttpService,
    private repository: NordigenRepository,
    @InjectRepository(NordigenCredentials)
    private readonly credentialsRepository: Repository<NordigenCredentials>,
    private readonly cipher: AiCredentialEncryptionService,
  ) {}

  async getCredentialStatus(userId: string) {
    const credentials = await this.credentialsRepository.findOne({
      where: { user_id: userId },
    });
    return {
      configured: Boolean(credentials),
      credentialHint: credentials?.credential_hint ?? null,
    };
  }

  async saveCredentials(userId: string, secretId: string, secretKey: string) {
    await this.validateCredentials(secretId, secretKey);
    const existing = await this.credentialsRepository.findOne({
      where: { user_id: userId },
      select: { id: true, user_id: true, credential_hint: true },
    });
    const credential = this.credentialsRepository.create({
      ...existing,
      user_id: userId,
      encrypted_credentials: this.cipher.encrypt(
        JSON.stringify({ secretId, secretKey }),
      ),
      credential_hint:
        secretKey.length > 4 ? `••••${secretKey.slice(-4)}` : '••••',
    });
    await this.credentialsRepository.save(credential);
    await this.repository.deleteUserToken(userId);
    return this.getCredentialStatus(userId);
  }

  async deleteCredentials(userId: string) {
    await this.credentialsRepository.delete({ user_id: userId });
    await this.repository.deleteUserToken(userId);
    return { configured: false, credentialHint: null };
  }

  async validateCredentials(secretId: string, secretKey: string) {
    const url = `${this.BASE_URL}/api/v2/token/new/`;
    try {
      await firstValueFrom(
        this.httpService.post(
          url,
          { secret_id: secretId, secret_key: secretKey },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        ),
      );
    } catch {
      throw new BadRequestException(
        'Nordigen credentials could not be validated',
      );
    }
    return { ok: true };
  }

  //#region token
  private async getAccessToken(userId: string): Promise<string> {
    const token = await this.getToken(userId);
    return token.access;
  }

  private async getToken(userId: string): Promise<NordigenToken> {
    const existingToken = await this.repository.getToken(userId);

    if (existingToken) {
      if (this.isTokenExpired(existingToken)) {
        if (existingToken.refresh_expires_on <= new Date()) {
          // Expired too long ago. Get a new one
          this.logger.log(
            'Refresh token expired. Deleting token and getting a new one',
          );
          await this.repository.deleteUserToken(userId);
          return await this.getNewToken(userId);
        } else {
          // Refresh token
          this.logger.log('Nordigen token is expired. Refresh token');
          return await this.refreshToken(
            userId,
            existingToken.id,
            existingToken.refresh,
          );
        }
      } else {
        return existingToken;
      }
    } else {
      // Get a new one
      this.logger.warn('No existing token. Getting a new one');
      return await this.getNewToken(userId);
    }
  }

  private async getNewToken(userId: string): Promise<NordigenToken> {
    this.logger.debug('Getting new Nordigen token');
    const url = `${this.BASE_URL}/api/v2/token/new/`;

    const nordigenConfig = await this.getCredentials(userId);
    const response = await firstValueFrom(
      this.httpService.post<NordigenTokenDto>(
        url,
        {
          secret_id: nordigenConfig.secretId,
          secret_key: nordigenConfig.secretKey,
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
      userId,
      dto.access,
      access_expiration_date,
      dto.refresh,
      refresh_expiration_date,
    );
  }

  private async refreshToken(
    userId: string,
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
      userId,
      tokenId,
      dto.access,
      dto.access_expires,
    );
  }

  private isTokenExpired(token: NordigenToken): boolean {
    const now = new Date();
    return token.access_expires_on < now;
  }

  private async getCredentials(
    userId: string,
  ): Promise<{ secretId: string; secretKey: string }> {
    const credential = await this.credentialsRepository
      .createQueryBuilder('credential')
      .addSelect('credential.encrypted_credentials')
      .where('credential.user_id = :userId', { userId })
      .getOne();
    if (!credential)
      throw new ServiceUnavailableException(
        'Configure Nordigen credentials in Settings first',
      );
    return JSON.parse(
      this.cipher.decrypt(credential.encrypted_credentials),
    ) as { secretId: string; secretKey: string };
  }

  //#endregion

  //#region institutions
  async getInstitutions(
    userId: string,
    countyCode: string,
  ): Promise<NordigenInstitutionDto[]> {
    return await this.makeGetRequest<NordigenInstitutionDto[]>(
      userId,
      `/api/v2/institutions/?country=${countyCode}`,
    );
  }

  async getInstitution(
    userId: string,
    institutionId: string,
  ): Promise<NordigenInstitutionDto> {
    return await this.makeGetRequest<NordigenInstitutionDto>(
      userId,
      `/api/v2/institutions/${institutionId}`,
    );
  }
  //#endregion

  //#region accounts
  async getAccountMetadata(
    userId: string,
    account_id: string,
  ): Promise<NordigenAccountMetadataDto> {
    return await this.makeGetRequest<NordigenAccountMetadataDto>(
      userId,
      `/api/v2/accounts/${account_id}/`,
    );
  }

  async getAccountDetails(
    userId: string,
    account_id: string,
  ): Promise<NordigenAccountDto> {
    const response = await this.makeGetRequest<NordigenAccountDetailsDto>(
      userId,
      `/api/v2/accounts/${account_id}/details/`,
    );
    this.logger.debug(`Retrieved Nordigen account details for ${account_id}`);
    return response.account;
  }

  async getAccountBalance(
    userId: string,
    account_id: string,
  ): Promise<NordigenAccountBalanceDto[]> {
    const response = await this.makeGetRequest<NordigenAccountBalancesDto>(
      userId,
      `/api/v2/accounts/${account_id}/balances/`,
    );
    return response.balances;
  }

  async getAccountTransactions(
    userId: string,
    account_id: string,
  ): Promise<NordigenTransactionDto[]> {
    this.logger.debug(
      `Getting Nordigen transactions for account ${account_id}`,
    );
    const response = await this.makeGetRequest<NordigenTransactionsDto>(
      userId,
      `/api/v2/accounts/${account_id}/transactions/`,
    );
    // We are not interested in the pending transactions yet. Better work only with booked for now
    return response.transactions.booked;
  }
  //#endregion

  //#region HTTP helpers
  async makeGetRequest<T>(userId: string, path: string): Promise<T> {
    const url = `${this.BASE_URL}${path}`;
    const token = await this.getAccessToken(userId);

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
            catchError((error: unknown) => {
              throw isAxiosError(error) ? error.response : error;
            }),
          ),
      );
      // Search for common HTTP status codes
      this.handleHttpStatusCodes(response);

      // If no exception thrown in the step before, then return the data
      // oxlint-disable-next-line typescript/no-unsafe-return
      return response.data;
    } catch (error_) {
      this.logger.error(
        `Error making Nordigen GET request to ${path}. Error: ${typeof error_}}`,
      );
      // oxlint-disable-next-line typescript/no-unsafe-argument
      this.handleHttpStatusCodes(error_, true);
      throw new InternalServerErrorException();
    }
  }

  private handleHttpStatusCodes(response: unknown, forceHandle = false) {
    if (this.isAxiosResponse(response)) {
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
    }

    // If forceHandle true, then throw an exception since this has to be handled here
    if (forceHandle) {
      this.logger.error(`Error making request to Nordigen`, {
        status: this.isAxiosResponse(response) ? response.status : undefined,
        error: this.isAxiosResponse(response) ? response.data : response,
      });
      throw new InternalServerErrorException();
    }
  }

  private isAxiosResponse(response: unknown): response is AxiosResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'status' in response &&
      typeof response.status === 'number' &&
      'data' in response
    );
  }

  async makePostRequest<T>(
    userId: string,
    path: string,
    payload: unknown,
  ): Promise<T> {
    const url = `${this.BASE_URL}${path}`;
    const token = await this.getAccessToken(userId);

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
            catchError((error: unknown) => {
              throw isAxiosError(error) ? error.response : error;
            }),
          ),
      );
      // Search for common HTTP status codes
      this.handleHttpStatusCodes(response);

      // oxlint-disable-next-line typescript/no-unsafe-return
      return response.data;
    } catch (error_) {
      this.logger.error(
        `Error making POST request to ${path}. Payload ${JSON.stringify(
          payload,
          null,
          4,
        )}`,
      );
      // oxlint-disable-next-line typescript/no-unsafe-argument
      this.handleHttpStatusCodes(error_, true);
      throw new InternalServerErrorException();
    }
  }

  async makeDeleteRequest<T>(userId: string, path: string): Promise<T> {
    const url = `${this.BASE_URL}${path}`;
    const token = await this.getAccessToken(userId);

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
            catchError((error: unknown) => {
              throw isAxiosError(error) ? error.response : error;
            }),
          ),
      );
      // Search for common HTTP status codes
      this.handleHttpStatusCodes(response);

      // If no exception thrown in the step before, then return the data
      // oxlint-disable-next-line typescript/no-unsafe-return
      return response.data;
    } catch (error_) {
      this.logger.error(`Error making Nordigen GET request to ${path}`);
      // oxlint-disable-next-line typescript/no-unsafe-argument
      this.handleHttpStatusCodes(error_, true);
      throw error_;
    }
  }
  //#endregion

  //# region requisitions
  async createRequisition(
    userId: string,
    institution_id: string,
    redirect_url: string,
  ): Promise<NordigenRequisitionDto> {
    const path = `/api/v2/requisitions/`;

    // oxlint-disable-next-line typescript/no-explicit-any
    const response = await this.makePostRequest<any>(userId, path, {
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
    userId: string,
    requisition_id: string,
  ): Promise<NordigenRequisitionDto> {
    this.logger.debug(`Getting the requisition id ${requisition_id} from API`);
    const path = `/api/v2/requisitions/${requisition_id}`;

    const response = await this.makeGetRequest<NordigenRequisitionDto>(
      userId,
      path,
    );
    return response;
  }

  async deleteRequisition(
    userId: string,
    requisition_id: string,
  ): Promise<DeleteRequisitionResponse> {
    this.logger.debug(`Getting the requisition id ${requisition_id} from API`);
    const path = `/api/v2/requisitions/${requisition_id}`;

    const response = await this.makeDeleteRequest<DeleteRequisitionResponse>(
      userId,
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
