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
import {
  NordigenAccountBalanceDto,
  NordigenAccountDto,
  NordigenAccountMetadataDto,
} from './dto/nordigen-account.dto';
import { NordigenTransactionDto } from './dto/nordigen-transaction.dto';

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
  private readonly logger = new Logger(NordigenUserService.name);

  /**
   * Creates a Nordigen client with the provided credentials.
   */
  createClient(credentials: NordigenCredentials): NordigenClient {
    return new NordigenClient({
      secretId: credentials.secretId,
      secretKey: credentials.secretKey,
      baseUrl: 'https://bankaccountdata.gocardless.com',
    });
  }

  /**
   * Creates an authenticated Nordigen client.
   * This client is ready to make API calls in the context of the user.
   */
  async createAuthenticatedClient(
    credentials: NordigenCredentials,
  ): Promise<NordigenClient> {
    const client = this.createClient(credentials);
    try {
      const response = await client.generateToken();
      client.token = response.access;
      return client;
    } catch (error) {
      this.logger.error('Failed to get Nordigen access token', error);
      throw new UnauthorizedException(
        'Invalid Nordigen credentials. Please check your secret ID and secret key.',
      );
    }
  }

  /**
   * Gets a new access token using user-provided credentials.
   * This token is NOT stored in the database - it's only used for the current operation.
   */
  async getAccessToken(credentials: NordigenCredentials): Promise<string> {
    this.logger.debug(
      'Getting new Nordigen access token with user credentials',
    );
    const client = this.createClient(credentials);

    try {
      const response = await client.generateToken();
      return response.access;
    } catch (error) {
      this.logger.error('Failed to get Nordigen access token', error);
      throw new InternalServerErrorException(
        'Invalid Nordigen credentials. Please check your secret ID and secret key.',
      );
    }
  }

  //#region accounts
  async getAccountMetadata(
    client: NordigenClient,
    account_id: string,
  ): Promise<NordigenAccountMetadataDto> {
    try {
      return await client.account(account_id).getMetadata();
    } catch (error) {
      this.handleError(error, `getting metadata for account ${account_id}`);
    }
  }

  async getAccountDetails(
    client: NordigenClient,
    account_id: string,
  ): Promise<NordigenAccountDto> {
    try {
      const response = await client.account(account_id).getDetails();
      return response.account;
    } catch (error) {
      this.handleError(error, `getting details for account ${account_id}`);
    }
  }

  async getAccountBalance(
    client: NordigenClient,
    account_id: string,
  ): Promise<NordigenAccountBalanceDto[]> {
    try {
      const response = await client.account(account_id).getBalances();
      return response.balances;
    } catch (error) {
      this.handleError(error, `getting balances for account ${account_id}`);
    }
  }

  async getAccountTransactions(
    client: NordigenClient,
    account_id: string,
  ): Promise<NordigenTransactionDto[]> {
    try {
      this.logger.debug(
        `Getting Nordigen transactions for account ${account_id}`,
      );
      const response = await client.account(account_id).getTransactions();
      return response.transactions.booked;
    } catch (error) {
      this.handleError(error, `getting transactions for account ${account_id}`);
    }
  }
  //#endregion

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
