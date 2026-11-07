import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { OpenbankingService } from './openbanking.service';
import {
  AuthorizeBankDto,
  BankAccountsDto,
  BankAuthorizationDto,
  BankConnectionDto,
  BankInstitutionDto,
  BankJobAcceptedDto,
  BankJobStatusDto,
  BankProviderDto,
  CreateBankConnectionDto,
  ImportBankAccountsDto,
  ReplaceBankCredentialsDto,
} from './dto/openbanking.dto';

@ApiTags('Open Banking')
@Controller('openbanking')
@UseGuards(ThrottlerGuard)
export class OpenbankingController {
  constructor(private readonly service: OpenbankingService) {}

  @Get('providers')
  @ApiOperation({
    summary: 'List supported bank providers and credential requirements',
  })
  @ApiOkResponse({ type: BankProviderDto, isArray: true })
  providers() {
    return this.service.providers();
  }

  @Get('connections')
  @ApiOperation({ summary: 'List your bank connections' })
  @ApiOkResponse({ type: BankConnectionDto, isArray: true })
  list(@RequestUser() user: UserPrincipal) {
    return this.service.list({ userId: user.id });
  }

  @Post('connections')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({
    summary: 'Validate credentials and create a bank connection',
  })
  @ApiBody({ type: CreateBankConnectionDto })
  @ApiCreatedResponse({ type: BankConnectionDto })
  create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateBankConnectionDto,
  ) {
    return this.service.create({ userId: user.id, dto });
  }

  @Get('connections/:id')
  @ApiOperation({ summary: 'Get a bank connection' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: BankConnectionDto })
  get(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.get({ userId: user.id, id });
  }

  @Put('connections/:id/credentials')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Replace bank provider credentials' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: ReplaceBankCredentialsDto })
  @ApiOkResponse({ type: BankConnectionDto })
  replace(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceBankCredentialsDto,
  ) {
    return this.service.replaceCredentials({
      userId: user.id,
      id,
      credentials: dto.credentials,
    });
  }

  @Delete('connections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Disconnect and delete saved credentials; retain imported accounts',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiNoContentResponse()
  remove(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove({ userId: user.id, id });
  }

  @Get('connections/:id/accounts')
  @ApiOperation({ summary: 'List the latest discovered accounts' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: BankAccountsDto })
  accounts(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.accounts({ userId: user.id, id });
  }

  @Post('connections/:id/accounts/refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Queue a bank account refresh' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiAcceptedResponse({ type: BankJobAcceptedDto })
  refresh(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.enqueue({ userId: user.id, id, operation: 'refresh' });
  }

  @Post('connections/:id/accounts/import')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Queue a bank account import' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: ImportBankAccountsDto })
  @ApiAcceptedResponse({ type: BankJobAcceptedDto })
  import(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ImportBankAccountsDto,
  ) {
    return this.service.enqueue({
      userId: user.id,
      id,
      operation: 'import',
      accountIds: dto.accountIds,
    });
  }

  @Post('connections/:id/sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Queue a bank account sync' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiAcceptedResponse({ type: BankJobAcceptedDto })
  sync(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.enqueue({ userId: user.id, id, operation: 'sync' });
  }

  @Delete('connections/:id/accounts/:accountId/link')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Stop syncing an imported account' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiParam({ name: 'accountId', type: String })
  @ApiNoContentResponse()
  unlink(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('accountId') accountId: string,
  ) {
    return this.service.unlink({ userId: user.id, id, accountId });
  }

  @Get('connections/:id/jobs/:jobId')
  @ApiOperation({ summary: 'Get bank operation progress and result' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiParam({ name: 'jobId', type: String, format: 'uuid' })
  @ApiOkResponse({ type: BankJobStatusDto })
  job(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return this.service.jobStatus({ userId: user.id, id, jobId });
  }

  @Get('connections/:id/institutions')
  @ApiOperation({
    summary: 'List institutions for a bank authorization provider',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'country', type: String })
  @ApiOkResponse({ type: BankInstitutionDto, isArray: true })
  institutions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('country') country: string,
  ) {
    return this.service.institutions({ userId: user.id, id, country });
  }

  @Post('connections/:id/authorizations')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Start bank authorization' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: AuthorizeBankDto })
  @ApiCreatedResponse({ type: BankAuthorizationDto })
  authorize(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AuthorizeBankDto,
  ) {
    return this.service.authorize({ userId: user.id, id, dto });
  }

  @Post('connections/:id/authorizations/:authorizationId/complete')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({
    summary: 'Verify bank authorization and queue account discovery',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiParam({ name: 'authorizationId', type: String, format: 'uuid' })
  @ApiAcceptedResponse({ type: BankJobAcceptedDto })
  complete(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('authorizationId', ParseUUIDPipe) authorizationId: string,
  ) {
    return this.service.completeAuthorization({
      userId: user.id,
      id,
      authorizationId,
    });
  }
}
