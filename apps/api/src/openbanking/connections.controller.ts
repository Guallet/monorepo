import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OpenbankingService } from './openbanking.service';
import { NordigenService } from 'src/nordigen/nordigen.service';
import { ConnectBankInstitutionRequestDto } from './dto/connect-account-request.dto';
import { UserPrincipal } from 'src/core/auth/user-principal';
import { RequestUser } from 'src/core/auth/request-user.decorator';
import { ConnectAccountsRequestDto } from './dto/connect-bank-request.dto';

@Controller('openbanking/connections')
export class ObConnectionsController {
  constructor(
    private readonly openbankingService: OpenbankingService,
    private readonly nordigenService: NordigenService,
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
  getInstitution(@Param('id') id: string) {
    // TODO: Cache this call in the DB? We should sync only once a day or less
    return this.nordigenService.getInstitution(id);
  }

  @Get(':id/accounts')
  async getObAccounts(
    @RequestUser() user: UserPrincipal,
    @Param('id') requisition_id: string,
  ) {
    const requisition = await this.nordigenService.getRequisition(
      requisition_id,
    );

    await this.openbankingService.saveRequisition(user.id, requisition);

    // Update the accounts info and Return the accounts
    const getAccountInfo = async (accountId) => {
      return {
        id: accountId,
        ...(await this.nordigenService.getAccountDetails(accountId)),
      };
    };
    const accountIds = requisition.accounts;

    const accounts = await Promise.all(
      accountIds.map((x) => getAccountInfo(x)),
    );

    return accounts;
  }

  @Get()
  async getConnections(@RequestUser() user: UserPrincipal) {
    return this.openbankingService.getConnections(user.id);
  }

  @Post()
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

  @Post('/connect')
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
