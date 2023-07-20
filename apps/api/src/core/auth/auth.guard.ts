import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { UserPrincipal } from './user_principal';
import * as jose from 'jose';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger('AUTH');
  private jwtSecret: string;

  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('AUTH_JWT_SECRET');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // If the endpoint is marked with @Public decorator, then bypass the auth
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Check if the token is valid
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request)
      .then((user) => {
        if (user == null) {
          throw new UnauthorizedException();
        }

        // Set the user in the request so it can be accessed later on
        // from request.user
        // TODO: Is there a better way to inject the user in the request? Needs investigation
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
    const key = new TextEncoder().encode(this.jwtSecret);

    const { payload } = await jose.jwtVerify(jwt, key);
    const email = payload.email as string;

    const expireEpchInSeconds = payload.exp ?? 0;
    const expireDate = new Date(expireEpchInSeconds * 1000); //From Seconds to Milliseconds

    if (expireDate <= new Date()) {
      throw 'Expired token';
    }

    if (!email) {
      throw 'Invalid token';
    }

    const uid = payload.sub;
    return new UserPrincipal(uid, email);
  }
}
