import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './is-public.decorator';
import { UserPrincipal } from './user-principal';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger('AUTH');
  private jwtSecret: string;

  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.jwtSecret = this.configService.get<string>('AUTH_JWT_SECRET');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // GraphQL Context is different, so decide which one to use
    const ctx = GqlExecutionContext.create(context);

    // If the endpoint is marked with @Public decorator, then bypass the auth
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Check if the token is valid
    const request = ctx.getContext().req;
    return this.validateRequest(request)
      .then((user) => {
        if (user == null) {
          throw new UnauthorizedException();
        }

        // Set the user in the request so it can be accessed later on
        // from request.user
        request.user = user;
        return true;
      })
      .catch((error) => {
        this.logger.error(`Error validating the auth token ${error}`);
        throw new UnauthorizedException();
      });
  }

  private async validateRequest(req: Request): Promise<UserPrincipal> {
    const token = req.headers.authorization;
    if (token != null && token != '') {
      const user = await this.verifyToken(token.replace('Bearer ', ''));
      return user;
    } else {
      return null;
    }
  }

  private async verifyToken(jwt: string): Promise<UserPrincipal> {
    try {
      // const key = new TextEncoder().encode(this.jwtSecret);

      // const { payload } = await jose.jwtVerify(jwt, key);
      const payload = await this.jwtService.verifyAsync(jwt, {
        secret: this.jwtSecret,
      });
      const email = payload.email as string;

      const expireEpochInSeconds = payload.exp ?? 0;
      const expireDate = new Date(expireEpochInSeconds * 1000); //From Seconds to Milliseconds

      if (expireDate <= new Date()) {
        throw 'Expired token';
      }

      if (!email) {
        throw 'Invalid token';
      }

      const uid = payload.sub;
      return new UserPrincipal(uid, email);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
