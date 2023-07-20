import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Used to extract the user data from the request
// More info: https://docs.nestjs.com/custom-decorators
export const RequestUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Samples
// @Get()
// findemail(@RequestUser('email') email: string) {
//   return email;
// }

// @Get('all')
// findAll(@RequestUser() user: UserPrincipal) {
//   return user;
// }
