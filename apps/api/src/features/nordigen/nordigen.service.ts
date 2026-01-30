import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import NordigenClient from 'nordigen-node';
import { NordigenInstitutionDto } from './dto/nordigen-institution.dto';
import {
  NordigenAccountBalanceDto,
  NordigenAccountDto,
  NordigenAccountMetadataDto,
} from './dto/nordigen-account.dto';
import { NordigenTransactionDto } from './dto/nordigen-transaction.dto';
import { NordigenRequisitionDto } from './dto/nordigen-requisition.dto';
import { randomUUID } from 'src/utils/crypto.utils';

interface NordigenToken {
  access: string;
  refresh: string;
  access_expires_on: Date;
  refresh_expires_on: Date;
}

@Injectable()
export class NordigenService {
  private readonly logger = new Logger(NordigenService.name);
  private readonly client: NordigenClient;
  private inMemoryToken: NordigenToken | null = null;

  constructor() {
    this.client = new NordigenClient({
      secretId: process.env.NORDIGEN_SECRET_ID || '',
      secretKey: process.env.NORDIGEN_SECRET_KEY || '',
      baseUrl: 'https://bankaccountdata.gocardless.com',
    });
  }

  //#region token
  private async ensureToken(): Promise<void> {
    if (this.inMemoryToken) {
      const now = new Date();
      if (this.inMemoryToken.access_expires_on < now) {
        if (this.inMemoryToken.refresh_expires_on <= now) {
          // Both expired, get new token
          this.logger.log('Refresh token expired. Getting new token pair');
          await this.getNewToken();
        } else {
          // Access expired, refresh it
          this.logger.log('Access token expired. Refreshing');
          await this.refreshToken();
        }
      } else {
        // Token still valid, just set it on the client
        this.client.token = this.inMemoryToken.access;
      }
    } else {
      // No token at all
      this.logger.warn('No in-memory token. Getting a new one');
      await this.getNewToken();
    }
  }

  private async getNewToken(): Promise<void> {
    try {
      const tokenData = (await this.client.generateToken()) as {
        access: string;
        refresh: string;
        access_expires: number;
        refresh_expires: number;
      };

      const now = new Date();
      this.inMemoryToken = {
        access: tokenData.access,
        refresh: tokenData.refresh,
        access_expires_on: new Date(
          now.getTime() + tokenData.access_expires * 1000,
        ),
        refresh_expires_on: new Date(
          now.getTime() + tokenData.refresh_expires * 1000,
        ),
      };

      this.client.token = tokenData.access;
    } catch (error) {
      this.logger.error('Failed to generate Nordigen token', error);
      throw new UnauthorizedException('Failed to authenticate with Nordigen');
    }
  }

  private async refreshToken(): Promise<void> {
    if (!this.inMemoryToken)
      throw new InternalServerErrorException('No token to refresh');

    try {
      const tokenData = (await this.client.exchangeToken({
        refreshToken: this.inMemoryToken.refresh,
      })) as { access: string; access_expires: number };

      const now = new Date();
      this.inMemoryToken = {
        ...this.inMemoryToken,
        access: tokenData.access,
        access_expires_on: new Date(
          now.getTime() + tokenData.access_expires * 1000,
        ),
      };

      this.client.token = tokenData.access;
    } catch (error) {
      this.logger.error('Failed to refresh Nordigen token', error);
      // If refresh fails, try getting a new one entirely
      await this.getNewToken();
    }
  }
  //#endregion

  //#region institutions
  async getInstitutions(
    countryCode: string,
  ): Promise<NordigenInstitutionDto[]> {
    await this.ensureToken();
    try {
      return (await this.client.institution.getInstitutions({
        country: countryCode,
      })) as NordigenInstitutionDto[];
    } catch (error) {
      this.handleError(error, `getting institutions for ${countryCode}`);
    }
  }

  async getInstitution(institutionId: string): Promise<NordigenInstitutionDto> {
    await this.ensureToken();
    try {
      return (await this.client.institution.getInstitutionById(
        institutionId,
      )) as NordigenInstitutionDto;
    } catch (error) {
      this.handleError(error, `getting institution ${institutionId}`);
    }
  }
  //#endregion

  //#region accounts
  async getAccountMetadata(
    account_id: string,
  ): Promise<NordigenAccountMetadataDto> {
    await this.ensureToken();
    try {
      return (await this.client
        .account(account_id)
        .getMetadata()) as NordigenAccountMetadataDto;
    } catch (error) {
      this.handleError(error, `getting metadata for account ${account_id}`);
    }
  }

  async getAccountDetails(account_id: string): Promise<NordigenAccountDto> {
    await this.ensureToken();
    try {
      const response = (await this.client.account(account_id).getDetails()) as {
        account: NordigenAccountDto;
      };
      return response.account;
    } catch (error) {
      this.handleError(error, `getting details for account ${account_id}`);
    }
  }

  async getAccountBalance(
    account_id: string,
  ): Promise<NordigenAccountBalanceDto[]> {
    await this.ensureToken();
    try {
      const response = (await this.client
        .account(account_id)
        .getBalances()) as { balances: NordigenAccountBalanceDto[] };
      return response.balances;
    } catch (error) {
      this.handleError(error, `getting balances for account ${account_id}`);
    }
  }

  async getAccountTransactions(
    account_id: string,
  ): Promise<NordigenTransactionDto[]> {
    await this.ensureToken();
    try {
      this.logger.debug(
        `Getting Nordigen transactions for account ${account_id}`,
      );
      const response = (await this.client
        .account(account_id)
        .getTransactions()) as {
        transactions: { booked: NordigenTransactionDto[] };
      };
      return response.transactions.booked;
    } catch (error) {
      this.handleError(error, `getting transactions for account ${account_id}`);
    }
  }
  //#endregion

  //#region requisitions
  async createRequisition(
    institution_id: string,
    redirect_url: string,
  ): Promise<NordigenRequisitionDto> {
    await this.ensureToken();
    try {
      return (await this.client.requisition.createRequisition({
        redirectUrl: redirect_url,
        institutionId: institution_id,
        reference: randomUUID(),
        ssn: '', // Required by library but optional in API
        redirectImmediate: false,
        accountSelection: false,
      })) as NordigenRequisitionDto;
    } catch (error) {
      this.handleError(error, `creating requisition for ${institution_id}`);
    }
  }

  async getRequisition(
    requisition_id: string,
  ): Promise<NordigenRequisitionDto> {
    await this.ensureToken();
    try {
      return (await this.client.requisition.getRequisitionById(
        requisition_id,
      )) as NordigenRequisitionDto;
    } catch (error) {
      this.handleError(error, `getting requisition ${requisition_id}`);
    }
  }

  async deleteRequisition(
    requisition_id: string,
  ): Promise<DeleteRequisitionResponse> {
    await this.ensureToken();
    try {
      return (await this.client.requisition.deleteRequisition(
        requisition_id,
      )) as DeleteRequisitionResponse;
    } catch (error) {
      this.handleError(error, `deleting requisition ${requisition_id}`);
    }
  }
  //#endregion

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(error: any, context: string): never {
    this.logger.error(`Error ${context}:`, error);

    if (error.response) {
      const status = error.response.status;
      switch (status) {
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

    throw new InternalServerErrorException(`Failed to ${context}`);
  }
}

export type DeleteRequisitionResponse = {
  summary: string;
  detail: string;
};
