import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';
import { NordigenService } from 'src/features/nordigen/nordigen.service';
import { ConnectBankInstitutionRequestDto } from './dto/connect-account-request.dto';
import { UserPrincipal } from 'src/auth/user-principal';
import { RequestUser } from 'src/auth/request-user.decorator';
import { ConnectAccountsRequestDto } from './dto/connect-bank-request.dto';
import { InstitutionsService } from 'src/features/institutions/institutions.service';
import { ApiTags } from '@nestjs/swagger';
import {
  NordigenAccountDto,
  NordigenAccountMetadataDto,
} from 'src/features/nordigen/dto/nordigen-account.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Open Banking')
@Controller('openbanking')
export class ObConnectionsController {
  private readonly logger = new Logger(ObConnectionsController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly openbankingService: OpenbankingService,
    private readonly nordigenService: NordigenService,
    private readonly institutionService: InstitutionsService,
  ) {}

  @Get('countries')
  getCountries(@Query('language') language?: string) {
    return this.openbankingService.getAvailableCountries(language ?? 'en');
  }

  @Get(':country/institutions')
  getInstitutions(@Param('country') country: string) {
    // TODO: Cache this call in the DB? We should sync only once a day or less
    return this.nordigenService.getInstitutions(country);
  }

  @Get('institutions/:id')
  async getInstitution(@Param('id') id: string) {
    const institution = await this.institutionService.findOneByNordigenId(id);
    if (institution === undefined || institution === null) {
      throw new NotFoundException();
    } else {
      return institution;
    }
  }

  @Get('connections/:id')
  async getConnectionDetails(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const connections = await this.openbankingService.getConnections(user.id);
    const connection = connections.find((x) => x.id === id);
    if (connection !== undefined && connection !== null) {
      return connection;
    } else {
      throw new NotFoundException();
    }
  }

  @Delete('connections/:id')
  async deleteConnection(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    try {
      const remoteResponse = await this.nordigenService.deleteRequisition(id);
      const deleteResult = await this.openbankingService.deleteConnection({
        connection_id: id,
        user_id: user.id,
      });
      return deleteResult;
    } catch (error) {
      // Log the error but don't throw it
      this.logger.error(
        `Couldn't delete requisition ${id} from Nordigen`,
        error,
      );
      if (this.configService.get('environment') === 'development') {
        throw new InternalServerErrorException({
          error: error,
          connection_id: id,
        });
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  @Get('connections/:id/accounts')
  async getObAccounts(
    @RequestUser() user: UserPrincipal,
    @Param('id') requisition_id: string,
  ): Promise<
    {
      id: string;
      metadata: NordigenAccountMetadataDto;
      details: NordigenAccountDto | null;
    }[]
  > {
    const requisition =
      await this.nordigenService.getRequisition(requisition_id);

    await this.openbankingService.saveRequisition(user.id, requisition);

    try {
      // Update the accounts info and Return the accounts
      const accountIds = requisition.accounts;
      const remoteAccounts: {
        id: string;
        metadata: NordigenAccountMetadataDto;
        details: NordigenAccountDto | null;
      }[] = [];
      for (const accountId of accountIds) {
        try {
          const accountMetadata =
            await this.nordigenService.getAccountMetadata(accountId);

          if (accountMetadata.status === 'READY') {
            try {
              const accountDetails =
                await this.nordigenService.getAccountDetails(accountId);
              remoteAccounts.push({
                id: accountId,
                metadata: accountMetadata,
                details: accountDetails,
              });
            } catch (error) {
              this.logger.error(
                `Couldn't get details metadata for account ${accountId}`,
              );
            }
          } else {
            remoteAccounts.push({
              id: accountId,
              metadata: accountMetadata,
              details: null,
            });
          }
        } catch (error) {
          this.logger.error(
            `Couldn't get account metadata for account ${accountId}`,
          );
        }
      }

      return remoteAccounts;
    } catch (error) {
      this.logger.error("Couldn't get accounts");
      throw new InternalServerErrorException({
        error: error,
        requisition: requisition,
      });
    }
  }

  @Get('connections')
  async getConnections(@RequestUser() user: UserPrincipal) {
    return this.openbankingService.getConnections(user.id);
  }

  @Post('connections')
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ConnectBankInstitutionRequestDto,
  ) {
    const requisition = await this.nordigenService.createRequisition(
      dto.institution_id,
      dto.redirect_to,
    );

    await this.openbankingService.saveRequisition(user.id, requisition);

    return {
      link: requisition.link,
      institution_id: requisition.institution_id,
    };
  }

  @Post('connections/connect')
  async connectToAccount(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ConnectAccountsRequestDto,
  ) {
    this.logger.debug(`Connecting to accounts: ${dto.account_ids.join(', ')}`);
    // Get Nordigen Account Metadata
    // Get Nordigen Account Details
    // Save the Nordigen account in the DB
    const openBankAccount = await this.openbankingService.connectToAccounts(
      user.id,
      dto.account_ids,
    );

    // Create Account in DB and link it with this open banking account
    // Get Nordigen Account Balances
    // Sync the account balance
    // Get Nordigen Account Transactions
    // Sync the account transactions
    // TODO: Can this sync be a external microservice? Refactor this with enough time
    return openBankAccount;
  }

  @Get('connections/:id/sync')
  async getObAccountTransactions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    try {
      const syncResult =
        await this.openbankingService.syncAccountTransactions(id);
      return syncResult;
    } catch (error) {
      this.logger.error("Couldn't get transactions");
      throw error;
    }
  }
}
