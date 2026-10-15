import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import {
  OptionalAuth,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';

@ApiTags('Session')
@Controller()
export class AppController {
  /**
   * Returns the current user's session information, if authenticated.
   * @param session The current user's session information.
   * @returns An object containing the user's session information.
   */
  @ApiOperation({ summary: 'getProfile' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        session: {
          type: 'object',
          description: 'Better Auth session and user data',
          nullable: true,
          additionalProperties: true,
        },
      },
    },
  })
  @Get('me')
  @OptionalAuth()
  getProfile(@Session() session: UserSession): { session: UserSession } {
    return {
      session: session,
    };
  }
}
