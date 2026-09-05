import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import {
  CurrentSessionDto,
  CurrentSessionResponseDto,
} from './dto/current-session.dto.js';

@Controller()
@ApiTags('Application')
export class AppController {
  /**
   * Returns the current user's session information, if authenticated.
   * @param session The current user's session information.
   * @returns An object containing the user's session information.
   */
  @Get('me')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get the current session, if authenticated' })
  @ApiResponse({ status: 200, type: CurrentSessionResponseDto })
  getProfile(
    @Session() session: UserSession | null | undefined,
  ): CurrentSessionResponseDto {
    return {
      session: session == null ? null : CurrentSessionDto.fromSession(session),
    };
  }
}
