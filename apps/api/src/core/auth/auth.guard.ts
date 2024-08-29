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
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger('AUTH GUARD');
  private jwtSecret: string;

  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {
    this.jwtSecret = this.configService.get<string>('auth.jwtSecret');
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
        request.user = user;
        return true;
      })
      .catch((error) => {
        this.logger.warn(`Error validating the auth token ${error}`);
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
      this.logger.debug(`Validating token: ${jwt}`);
      const payload = await this.jwtService.verifyAsync(jwt, {
        secret: this.jwtSecret,
      });
      this.logger.debug(`Token payload: ${JSON.stringify(payload)}`);
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

      // Make a request to get the user roles
      // TODO: This is a good place to check if the user is registered or not,
      // to implement an invitation only system
      try {
        const roles = await this.userService.getUserRoles(uid);
        return new UserPrincipal(uid, email, roles);
      } catch (e) {
        this.logger.warn(`Error getting user roles: ${e}`);
        return new UserPrincipal(uid, email);
      }
    } catch (e) {
      this.logger.warn(`Error validating the token: ${e}`);
      throw new UnauthorizedException();
    }
  }
}
