import { Controller, Get } from '@nestjs/common';
import {
  OptionalAuth,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller()
export class AppController {
  @Get('me')
  @OptionalAuth()
  getProfile(@Session() session: UserSession) {
    return {
      session: session,
    };
  }
}
