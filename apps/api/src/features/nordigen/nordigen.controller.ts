import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RequestUser } from 'src/auth/request-user.decorator';
import { UserPrincipal } from 'src/auth/user-principal';
import { NordigenService } from './nordigen.service';
import {
  NordigenCredentialStatusDto,
  SaveNordigenCredentialsDto,
} from './dto/nordigen-credentials.dto';

@Controller('nordigen')
@ApiTags('Nordigen')
@UseGuards(ThrottlerGuard)
export class NordigenController {
  constructor(private readonly nordigenService: NordigenService) {}

  @Get('credentials')
  @ApiOperation({ summary: 'Get Nordigen credential status' })
  @ApiOkResponse({ type: NordigenCredentialStatusDto })
  getCredentials(@RequestUser() user: UserPrincipal) {
    return this.nordigenService.getCredentialStatus(user.id);
  }

  @Post('credentials')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate and save Nordigen credentials' })
  @ApiBody({ type: SaveNordigenCredentialsDto })
  @ApiOkResponse({ type: NordigenCredentialStatusDto })
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  saveCredentials(
    @RequestUser() user: UserPrincipal,
    @Body() dto: SaveNordigenCredentialsDto,
  ) {
    return this.nordigenService.saveCredentials(
      user.id,
      dto.secretId,
      dto.secretKey,
    );
  }

  @Delete('credentials')
  @ApiOperation({ summary: 'Remove Nordigen credentials' })
  @ApiOkResponse({ type: NordigenCredentialStatusDto })
  deleteCredentials(@RequestUser() user: UserPrincipal) {
    return this.nordigenService.deleteCredentials(user.id);
  }
}
