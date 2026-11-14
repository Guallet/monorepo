import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers as RequestHeader,
  HttpCode,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  NativeFlowQueryDto,
  NativeCallbackQueryDto,
  CompleteNativeResetDto,
  NativeAuthResultDto,
  NativeFlowDto,
  NativeGoogleFlowDto,
  RedeemNativeFlowDto,
  StartNativeFlowDto,
  StartNativeResetDto,
} from './dto/native-auth.dto';
import { NativeAuthService } from './native-auth.service';
import {
  BROWSER_BINDING_COOKIE,
  NativeHandoffBroker,
} from './native-handoff.broker';

@ApiTags('Native authentication')
@ApiBadRequestResponse({
  description: 'Invalid, expired or already redeemed flow.',
})
@ApiResponse({ status: 429, description: 'Too many authentication attempts.' })
@AllowAnonymous()
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 30, ttl: 60_000 } })
@Controller('native-auth')
export class NativeAuthController {
  constructor(
    private readonly service: NativeAuthService,
    private readonly broker: NativeHandoffBroker,
  ) {}
  private nativeOrigin(origin: string | undefined) {
    // Prevent browser login-CSRF. This is an origin check, not a claim of device attestation.
    if (origin !== 'guallet-android://')
      throw new BadRequestException('Native origin required.');
  }
  private noStore(response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Referrer-Policy', 'no-referrer');
  }
  @Post('google')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create a verifier-bound native Google sign-in flow',
  })
  @ApiBody({ type: StartNativeFlowDto })
  @ApiOkResponse({ type: NativeGoogleFlowDto })
  @ApiHeader({ name: 'Origin', required: true, example: 'guallet-android://' })
  async google(
    @Body() body: StartNativeFlowDto,
    @RequestHeader('origin') origin: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.nativeOrigin(origin);
    this.noStore(response);
    return this.service.createGoogle(body);
  }
  @Get('google/start')
  @ApiOperation({
    summary: 'Start Google sign-in in the browser, setting OAuth state cookies',
  })
  @ApiQuery({ name: 'flowId', type: String })
  @ApiResponse({
    status: 302,
    description:
      'HTTPS Google authorization redirect with secure browser cookies.',
  })
  async start(@Query() query: NativeFlowQueryDto, @Res() response: Response) {
    this.noStore(response);
    const result = await this.service.startGoogle({ flowId: query.flowId });
    response.setHeader('Set-Cookie', [
      ...result.cookies,
      `${BROWSER_BINDING_COOKIE}=${result.binding}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    ]);
    response.redirect(302, result.url);
  }
  @Get('google/callback')
  @ApiOperation({
    summary:
      'Redirect an already completed Google handoff to Android without credentials',
  })
  @ApiQuery({ name: 'flowId', type: String })
  @ApiQuery({ name: 'code', type: String })
  @ApiResponse({
    status: 302,
    description:
      'Native callback containing only flow and verifier-bound completion code.',
  })
  async googleCallback(
    @Query() query: NativeCallbackQueryDto,
    @Res() response: Response,
  ) {
    this.noStore(response);
    response.redirect(
      302,
      await this.broker.redirect('google', query.flowId, query.code),
    );
  }
  @Post('google/exchange')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Atomically redeem a Google handoff using the private native verifier',
  })
  @ApiBody({ type: RedeemNativeFlowDto })
  @ApiOkResponse({
    type: NativeAuthResultDto,
    headers: {
      'Set-Cookie': {
        description: 'Better Auth secure session cookie',
        schema: { type: 'string' },
      },
    },
  })
  @ApiHeader({ name: 'Origin', required: true, example: 'guallet-android://' })
  async exchange(
    @Body() body: RedeemNativeFlowDto,
    @RequestHeader('origin') origin: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.nativeOrigin(origin);
    this.noStore(response);
    response.setHeader('Set-Cookie', await this.service.exchangeGoogle(body));
    return { success: true };
  }
  @Post('reset')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary:
      'Request an email reset link bound to the requesting Android app verifier',
  })
  @ApiBody({ type: StartNativeResetDto })
  @ApiOkResponse({ type: NativeFlowDto })
  @ApiHeader({ name: 'Origin', required: true, example: 'guallet-android://' })
  async reset(
    @Body() body: StartNativeResetDto,
    @RequestHeader('origin') origin: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.nativeOrigin(origin);
    this.noStore(response);
    return this.service.createReset(body);
  }
  @Get('reset/callback')
  @ApiOperation({
    summary:
      'Redirect a completed email reset handoff to Android without reset tokens',
  })
  @ApiQuery({ name: 'flowId', type: String })
  @ApiQuery({ name: 'code', type: String })
  @ApiResponse({
    status: 302,
    description:
      'Native callback containing only flow and verifier-bound completion code.',
  })
  async resetCallback(
    @Query() query: NativeCallbackQueryDto,
    @Res() response: Response,
  ) {
    this.noStore(response);
    response.redirect(
      302,
      await this.broker.redirect('reset', query.flowId, query.code),
    );
  }
  @Post('reset/complete')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary:
      'Redeem a reset handoff and change the password through Better Auth',
  })
  @ApiBody({ type: CompleteNativeResetDto })
  @ApiOkResponse({ type: NativeAuthResultDto })
  @ApiHeader({ name: 'Origin', required: true, example: 'guallet-android://' })
  async complete(
    @Body() body: CompleteNativeResetDto,
    @RequestHeader('origin') origin: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.nativeOrigin(origin);
    this.noStore(response);
    return this.service.finishReset(body);
  }
}
