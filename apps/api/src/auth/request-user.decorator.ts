import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPrincipal } from './user-principal.js';

// Used to extract the user data from the request
// More info: https://docs.nestjs.com/custom-decorators
export const RequestUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.session?.user;

    // TODO: Map the roles properly when User entity is fixed
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const principal = new UserPrincipal(user.id, user.email);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data ? principal[data] : principal;
    } else {
      return null;
    }
  },
);

// HOW TO USE SAMPLES
// @Get()
// findEmail(@RequestUser('email') email: string) {
//   return email;
// }

// @Get('all')
// findAll(@RequestUser() user: UserPrincipal) {
//   return user;
// }
