import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// Used to extract the user data from the request
// More info: https://docs.nestjs.com/custom-decorators
export const RequestUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = GqlExecutionContext.create(ctx).getContext().req;

    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// HOW TO USE SAMPLES
// @Get()
// findemail(@RequestUser('email') email: string) {
//   return email;
// }

// @Get('all')
// findAll(@RequestUser() user: UserPrincipal) {
//   return user;
// }
