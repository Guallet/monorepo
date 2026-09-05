import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { OpenbankingService } from './openbanking.service.js';
import { NordigenService } from '../../features/nordigen/nordigen.service.js';
import { ConnectBankInstitutionRequestDto } from './dto/connect-account-request.dto.js';
import { UserPrincipal } from '../../auth/user-principal.js';
import { RequestUser } from '../../auth/request-user.decorator.js';
import { ConnectAccountsRequestDto } from './dto/connect-bank-request.dto.js';
import { InstitutionsService } from '../../features/institutions/institutions.service.js';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  NordigenAccountDto,
  NordigenAccountMetadataDto,
} from '../../features/nordigen/dto/nordigen-account.dto.js';
import { NordigenInstitutionDto } from '../../features/nordigen/dto/nordigen-institution.dto.js';
import { InstitutionDto } from '../../features/institutions/dto/institution.dto.js';
import {
  ConnectOpenBankingAccountsResponseDto,
  CreateOpenBankingConnectionResponseDto,
  DeleteOpenBankingConnectionResponseDto,
  OpenBankingConnectionAccountDto,
  OpenBankingConnectionDto,
  OpenBankingCountryDto,
  SyncOpenBankingAccountResponseDto,
} from './dto/openbanking-response.dto.js';

@ApiTags('Open Banking')
@Controller('openbanking')
export class ObConnectionsController {
  private readonly logger = new Logger(ObConnectionsController.name);

  constructor(
    private readonly openbankingService: OpenbankingService,
    private readonly nordigenService: NordigenService,
    private readonly institutionService: InstitutionsService,
  ) {}

  @Get('countries')
  @ApiOperation({ summary: 'List supported Open Banking countries' })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    minLength: 2,
    maxLength: 2,
    example: 'en',
  })
  @ApiResponse({ status: 200, type: [OpenBankingCountryDto] })
  getCountries(@Query('language') language?: string): OpenBankingCountryDto[] {
    return this.openbankingService.getAvailableCountries(language ?? 'en');
  }

  @Get(':country/institutions')
  @ApiOperation({ summary: 'List Open Banking institutions for a country' })
  @ApiParam({
    name: 'country',
    description: 'Two-letter country code',
    schema: { type: 'string', minLength: 2, maxLength: 2 },
    example: 'GB',
  })
  @ApiResponse({ status: 200, type: [NordigenInstitutionDto] })
  getInstitutions(@Param('country') country: string) {
    // TODO: Cache this call in the DB? We should sync only once a day or less
    return this.nordigenService.getInstitutions(country);
  }

  @Get('institutions/:id')
  @ApiOperation({ summary: 'Get a bank institution by Nordigen ID' })
  @ApiParam({ name: 'id', description: 'Nordigen institution ID' })
  @ApiResponse({ status: 200, type: InstitutionDto })
  async getInstitution(@Param('id') id: string): Promise<InstitutionDto> {
    const institution = await this.institutionService.findOneByNordigenId(id);
    if (institution === undefined || institution === null) {
      throw new NotFoundException();
    } else {
      return InstitutionDto.fromDomain(institution);
    }
  }

  @Get('connections/:id')
  @ApiOperation({ summary: 'Get an Open Banking connection' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Connection ID' })
  @ApiResponse({ status: 200, type: OpenBankingConnectionDto })
  async getConnectionDetails(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OpenBankingConnectionDto> {
    const connection = await this.openbankingService.getConnection(user.id, id);
    return OpenBankingConnectionDto.fromEntity(connection);
  }

  @Delete('connections/:id')
  @ApiOperation({ summary: 'Delete an Open Banking connection' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Connection ID' })
  @ApiResponse({ status: 200, type: DeleteOpenBankingConnectionResponseDto })
  async deleteConnection(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteOpenBankingConnectionResponseDto> {
    await this.openbankingService.getConnection(user.id, id);

    try {
      const remoteResponse = await this.nordigenService.deleteRequisition(id);
      this.logger.debug(
        `Deleted requisition ${id} from Nordigen: ${JSON.stringify(
          remoteResponse,
        )}`,
      );
    } catch (error) {
      this.logger.error(
        `Couldn't delete requisition ${id} from Nordigen`,
        error,
      );
      throw new InternalServerErrorException();
    }

    return this.openbankingService.deleteConnection({
      connection_id: id,
      user_id: user.id,
    });
  }

  @Get('connections/:id/accounts')
  @ApiOperation({
    summary: 'Retrieve and synchronize accounts for a connection',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Connection or requisition ID',
  })
  @ApiResponse({ status: 200, type: [OpenBankingConnectionAccountDto] })
  async getObAccounts(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) requisition_id: string,
  ): Promise<OpenBankingConnectionAccountDto[]> {
    await this.openbankingService.getConnection(user.id, requisition_id);
    const requisition =
      await this.nordigenService.getRequisition(requisition_id);

    await this.openbankingService.updateRequisition(user.id, requisition);

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
                error,
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
            error,
          );
        }
      }

      return remoteAccounts;
    } catch (error) {
      this.logger.error("Couldn't get accounts", error);
      throw new InternalServerErrorException();
    }
  }

  @Get('connections')
  @ApiOperation({ summary: 'List the current user’s Open Banking connections' })
  @ApiResponse({ status: 200, type: [OpenBankingConnectionDto] })
  async getConnections(
    @RequestUser() user: UserPrincipal,
  ): Promise<OpenBankingConnectionDto[]> {
    const connections = await this.openbankingService.getConnections(user.id);
    return connections.map(OpenBankingConnectionDto.fromEntity);
  }

  @Post('connections')
  @ApiOperation({ summary: 'Start an Open Banking connection' })
  @ApiBody({ type: ConnectBankInstitutionRequestDto })
  @ApiResponse({ status: 201, type: CreateOpenBankingConnectionResponseDto })
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ConnectBankInstitutionRequestDto,
  ): Promise<CreateOpenBankingConnectionResponseDto> {
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
  @ApiOperation({ summary: 'Connect selected Open Banking accounts' })
  @ApiBody({ type: ConnectAccountsRequestDto })
  @ApiResponse({ status: 201, type: ConnectOpenBankingAccountsResponseDto })
  async connectToAccount(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ConnectAccountsRequestDto,
  ): Promise<ConnectOpenBankingAccountsResponseDto> {
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

  @Post('connections/:id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Synchronize transactions for an Open Banking connection',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Connection ID' })
  @ApiResponse({ status: 200, type: SyncOpenBankingAccountResponseDto })
  async getObAccountTransactions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SyncOpenBankingAccountResponseDto> {
    try {
      await this.openbankingService.syncAccountTransactions(user.id, id);
      return { account_id: id, synced: true };
    } catch (error) {
      this.logger.error("Couldn't get transactions");
      throw error;
    }
  }
}
