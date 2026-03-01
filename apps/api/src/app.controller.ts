import { Controller, Get } from '@nestjs/common';
import {
  OptionalAuth,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller()
export class AppController {
  /**
   * Returns the current user's session information, if authenticated.
   * @param session The current user's session information.
   * @returns An object containing the user's session information.
   */
  @Get('me')
  @OptionalAuth()
  getProfile(@Session() session: UserSession): { session: UserSession } {
    return {
      session: session,
    };
  }
}
