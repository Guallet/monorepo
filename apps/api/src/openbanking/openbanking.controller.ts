import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Post,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/core/auth/public.decorator';
import { RequestUser } from 'src/core/auth/requestuser.decorator';
import { UserPrincipal } from 'src/core/auth/user_principal';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { ConnectBankInstitutionRequestDto } from './dto/connect_account_request.dto';
import { ConnectAccountsRequestDto } from './dto/connect_bank_request.dto';
import { OpenbankingService } from './openbanking.service';

@ApiTags('Open Banking')
@Controller('openbanking')
export class OpenbankingController {
  private readonly logger = new Logger(OpenbankingController.name);

  constructor(
    private readonly openbankingService: OpenbankingService,
    private readonly nordigenService: NordigenService,
  ) {}

  /**
   * Lists all the available counties with available banks to connect
   */
  @Public()
  @ApiQuery({
    name: 'language',
    type: String,
    example: 'en',
    description:
      'The language used to translate the country names. 2 Letters code.',
    required: false,
  })
  @Get('/countries')
  findAvailableCountries(@Query('language') language?: string) {
    return this.openbankingService.getAvailableCountries(language ?? 'en');
  }

  /**
   * Given the country code, lists all the available banks to connect to
   */
  @Public()
  @ApiQuery({
    name: 'country',
    type: String,
    example: 'gb',
    description: 'The country code (2 Letters) to get the banks',
    required: false,
  })
  @Get('/institutions')
  findInstitutionsByCountry(@Query('country') countryCode: string) {
    if (!countryCode) {
      return new BadRequestException(`Missing country parameter`);
    }
    return this.openbankingService.getInsitutions(countryCode);
  }

  /**
   * Initiate the connection to an open bank.
   */
  @Post('/connect')
  async getLink(
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

  /**
   * Gets all the available accounts to connect for a given bank connection
   * @param {string} requisitionId - The requisition ID
   */
  @Get('/connect/:id/accounts')
  async getAccounts(
    @RequestUser() user: UserPrincipal,
    @Param('id') requisitionId: string,
  ) {
    // Update requisition with new info
    const accounts = await this.openbankingService.getRequisitionAccounts(
      user.id,
      requisitionId,
    );

    return accounts;
  }

  /**
   * Creates a link to the given account and starts syncing the transactions
   */
  @Post('/connect/accounts')
  async connectToAccount(
    @RequestUser() user: UserPrincipal,
    @Body() dto: ConnectAccountsRequestDto,
  ) {
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
    // TDOD: Can this sync be a external microservice? Refactor this with enough time

    return openBankAccount;
  }
}
