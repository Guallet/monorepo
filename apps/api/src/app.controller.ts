import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './core/auth/public.decorator';
import { RequestUser } from './core/auth/requestuser.decorator';
import { UserPrincipal } from './core/auth/user_principal';

@ApiTags('Dev tools')
@Controller()
export class AppController {
  @Public()
  @Get('ping')
  ping(): any {
    return {
      message: 'Hello guallet',
    };
  }

  @Get('pong')
  protected(@RequestUser() user: UserPrincipal): any {
    return {
      auth_user: user,
    };
  }
}
