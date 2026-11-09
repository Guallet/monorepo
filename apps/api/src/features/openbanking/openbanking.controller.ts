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
  AuthorizeBankRequestDto,
  BankAccountsDto,
  BankAuthorizationDto,
  BankConnectionDto,
  BankInstitutionDto,
  BankJobAcceptedDto,
  BankJobStatusDto,
  BankProviderDto,
  CreateBankConnectionRequestDto,
  ImportBankAccountsRequestDto,
  ReplaceBankCredentialsRequestDto,
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
  providers(): BankProviderDto[] {
    return this.service
      .providers()
      .map((value) => BankProviderDto.fromDomain(value));
  }

  @Get('connections')
  @ApiOperation({ summary: 'List your bank connections' })
  @ApiOkResponse({ type: BankConnectionDto, isArray: true })
  async list(@RequestUser() user: UserPrincipal): Promise<BankConnectionDto[]> {
    const connections = await this.service.list({ userId: user.id });
    return connections.map((value) => BankConnectionDto.fromDomain(value));
  }

  @Post('connections')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({
    summary: 'Validate credentials and create a bank connection',
  })
  @ApiBody({ type: CreateBankConnectionRequestDto })
  @ApiCreatedResponse({ type: BankConnectionDto })
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateBankConnectionRequestDto,
  ): Promise<BankConnectionDto> {
    const connection = await this.service.create({
      userId: user.id,
      input: { providerId: dto.providerId, credentials: dto.credentials },
    });
    return BankConnectionDto.fromDomain(connection);
  }

  @Get('connections/:id')
  @ApiOperation({ summary: 'Get a bank connection' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: BankConnectionDto })
  async get(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BankConnectionDto> {
    const connection = await this.service.get({ userId: user.id, id });
    return BankConnectionDto.fromDomain(connection);
  }

  @Put('connections/:id/credentials')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Replace bank provider credentials' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: ReplaceBankCredentialsRequestDto })
  @ApiOkResponse({ type: BankConnectionDto })
  async replace(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceBankCredentialsRequestDto,
  ): Promise<BankConnectionDto> {
    const connection = await this.service.replaceCredentials({
      userId: user.id,
      id,
      credentials: dto.credentials,
    });
    return BankConnectionDto.fromDomain(connection);
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
  ): Promise<void> {
    return this.service.remove({ userId: user.id, id });
  }

  @Get('connections/:id/accounts')
  @ApiOperation({ summary: 'List the latest discovered accounts' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiOkResponse({ type: BankAccountsDto })
  async accounts(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BankAccountsDto> {
    const accounts = await this.service.accounts({ userId: user.id, id });
    return BankAccountsDto.fromDomain(accounts);
  }

  @Post('connections/:id/accounts/refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Queue a bank account refresh' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiAcceptedResponse({ type: BankJobAcceptedDto })
  async refresh(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BankJobAcceptedDto> {
    const job = await this.service.enqueue({
      userId: user.id,
      id,
      operation: 'refresh',
    });
    return BankJobAcceptedDto.fromDomain(job);
  }

  @Post('connections/:id/accounts/import')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Queue a bank account import' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: ImportBankAccountsRequestDto })
  @ApiAcceptedResponse({ type: BankJobAcceptedDto })
  async import(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ImportBankAccountsRequestDto,
  ): Promise<BankJobAcceptedDto> {
    const job = await this.service.enqueue({
      userId: user.id,
      id,
      operation: 'import',
      accountIds: dto.accountIds,
    });
    return BankJobAcceptedDto.fromDomain(job);
  }

  @Post('connections/:id/sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Queue a bank account sync' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiAcceptedResponse({ type: BankJobAcceptedDto })
  async sync(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BankJobAcceptedDto> {
    const job = await this.service.enqueue({
      userId: user.id,
      id,
      operation: 'sync',
    });
    return BankJobAcceptedDto.fromDomain(job);
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
  ): Promise<void> {
    return this.service.unlink({ userId: user.id, id, accountId });
  }

  @Get('connections/:id/jobs/:jobId')
  @ApiOperation({ summary: 'Get bank operation progress and result' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiParam({ name: 'jobId', type: String, format: 'uuid' })
  @ApiOkResponse({ type: BankJobStatusDto })
  async job(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<BankJobStatusDto> {
    const job = await this.service.jobStatus({ userId: user.id, id, jobId });
    return BankJobStatusDto.fromDomain(job);
  }

  @Get('connections/:id/institutions')
  @ApiOperation({
    summary: 'List institutions for a bank authorization provider',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'country', type: String })
  @ApiOkResponse({ type: BankInstitutionDto, isArray: true })
  async institutions(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('country') country: string,
  ): Promise<BankInstitutionDto[]> {
    const institutions = await this.service.institutions({
      userId: user.id,
      id,
      country,
    });
    return institutions.map((value) => BankInstitutionDto.fromDomain(value));
  }

  @Post('connections/:id/authorizations')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Start bank authorization' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: AuthorizeBankRequestDto })
  @ApiCreatedResponse({ type: BankAuthorizationDto })
  async authorize(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AuthorizeBankRequestDto,
  ): Promise<BankAuthorizationDto> {
    const authorization = await this.service.authorize({
      userId: user.id,
      id,
      input: { institutionId: dto.institutionId, redirectUrl: dto.redirectUrl },
    });
    return BankAuthorizationDto.fromDomain(authorization);
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
  async complete(
    @RequestUser() user: UserPrincipal,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('authorizationId', ParseUUIDPipe) authorizationId: string,
  ): Promise<BankJobAcceptedDto> {
    const job = await this.service.completeAuthorization({
      userId: user.id,
      id,
      authorizationId,
    });
    return BankJobAcceptedDto.fromDomain(job);
  }
}
