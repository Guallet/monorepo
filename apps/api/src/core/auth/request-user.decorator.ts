import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// Used to extract the user data from the request
// More info: https://docs.nestjs.com/custom-decorators
export const RequestUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // GraphQL uses a different context, so be sure whe got
    // the correct request in both HTTP and GRAPHQL
    const request =
      ctx.switchToHttp().getRequest() ??
      GqlExecutionContext.create(ctx).getContext().req;
    const user = request.user;

    return data ? user?.[data] : user;
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
