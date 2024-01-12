import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Error as STError } from 'supertokens-node';
import { SessionContainer } from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';

import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { IS_PUBLIC_KEY } from './is-public.decorator';
import { UserPrincipal } from './user-principal';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger('SUPERTOKENS AUTH');

  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  private httpRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }

  private graphQLRequest(context: ExecutionContext) {
    return this.graphQLContext(context).getContext().req as Request;
  }

  private graphQLContext(context: ExecutionContext) {
    return GqlExecutionContext.create(context);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // GraphQL Context is different, so decide which one to use
    const raw_ctx =
      this.httpRequest(context) !== null
        ? context
        : this.graphQLContext(context);

    const ctx = context.switchToHttp();

    // If the endpoint is marked with @Public decorator, then bypass the auth
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      raw_ctx.getHandler(),
      raw_ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    let err = undefined;
    const resp = ctx.getResponse();
    // You can create an optional version of this by passing {sessionRequired: false} to verifySession
    // await verifySession(this.verifyOptions)(ctx.getRequest(), resp, (res) => {
    await verifySession()(ctx.getRequest(), resp, (res) => {
      err = res;
    });

    if (resp.headersSent) {
      throw new STError({
        message: 'RESPONSE_SENT',
        type: 'RESPONSE_SENT',
      });
    }

    if (err) {
      throw err;
    }

    // Set the user in the request so it can be accessed later on
    // from request.user
    const request = this.httpRequest(context) ?? this.graphQLRequest(context);
    const session = request.session as SessionContainer;
    const userId = session.getUserId();
    const rolesResponse = await UserRoles.getRolesForUser('public', userId);
    const roles = rolesResponse.roles;

    request.user = new UserPrincipal(userId, session, roles);
    return true;
  }
}
