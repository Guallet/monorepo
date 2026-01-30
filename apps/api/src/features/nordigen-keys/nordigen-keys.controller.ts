import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { NordigenKeysService } from './nordigen-keys.service';
import {
  CreateNordigenKeyRequest,
  UpdateNordigenKeyRequest,
  LinkAccountsRequest,
  NordigenKeyDto,
} from './dto/nordigen-key.dto';

@ApiTags('Nordigen Keys')
@Controller('nordigen-keys')
export class NordigenKeysController {
  private readonly logger = new Logger(NordigenKeysController.name);

  constructor(private readonly nordigenKeysService: NordigenKeysService) { }

  @Get()
  async getAll(
    @RequestUser() user: UserPrincipal,
  ): Promise<NordigenKeyDto[]> {
    const keys = await this.nordigenKeysService.findAllByUser(user.id);
    return keys.map((key) => NordigenKeyDto.fromEntity(key));
  }

  @Get(':id')
  async getById(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<NordigenKeyDto> {
    const key = await this.nordigenKeysService.findById(user.id, id);
    return NordigenKeyDto.fromEntity(key);
  }

  @Post()
  async create(
    @RequestUser() user: UserPrincipal,
    @Body() dto: CreateNordigenKeyRequest,
  ): Promise<NordigenKeyDto> {
    const key = await this.nordigenKeysService.create(user.id, dto);
    return NordigenKeyDto.fromEntity(key);
  }

  @Put(':id')
  async update(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateNordigenKeyRequest,
  ): Promise<NordigenKeyDto> {
    const key = await this.nordigenKeysService.update(user.id, id, dto);
    return NordigenKeyDto.fromEntity(key);
  }

  @Delete(':id')
  async delete(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
  ): Promise<NordigenKeyDto> {
    const deleted = await this.nordigenKeysService.delete(user.id, id);
    return NordigenKeyDto.fromEntity(deleted);
  }

  @Post(':id/accounts')
  async linkAccounts(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: LinkAccountsRequest,
  ): Promise<NordigenKeyDto> {
    const key = await this.nordigenKeysService.linkAccounts(
      user.id,
      id,
      dto.account_ids,
    );
    return NordigenKeyDto.fromEntity(key);
  }

  @Delete(':id/accounts')
  async unlinkAccounts(
    @RequestUser() user: UserPrincipal,
    @Param('id') id: string,
    @Body() dto: LinkAccountsRequest,
  ): Promise<NordigenKeyDto> {
    const key = await this.nordigenKeysService.unlinkAccounts(
      user.id,
      id,
      dto.account_ids,
    );
    return NordigenKeyDto.fromEntity(key);
  }
}
