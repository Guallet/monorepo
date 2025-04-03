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
import { UsersService } from 'src/features/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AUTH GUARD');
  private readonly jwtSecret: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('auth.jwtSecret');
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

        // Set the Apitally user
        request.apitallyConsumer = {
          identifier: user.id,
          name: user.email,
          group: JSON.stringify(user.roles),
        };

        return true;
      })
      .catch((error) => {
        this.logger.warn(`Error validating the auth token ${error}`);
        throw new UnauthorizedException();
      });
  }

  private async validateRequest(req: Request): Promise<UserPrincipal | null> {
    const token = req.headers.authorization;
    if (token != null && token != '') {
      return await this.verifyToken(token.replace('Bearer ', ''));
    } else {
      return null;
    }
  }

  private async verifyToken(jwt: string): Promise<UserPrincipal> {
    try {
      this.logger.debug(`Validating auth token`);
      const payload = await this.jwtService.verifyAsync(jwt, {
        secret: this.jwtSecret,
      });
      const email = payload.email as string;
      const uid = payload.sub as string;

      if (!email) {
        throw new Error('Invalid token');
      }

      if (!uid) {
        throw new Error('Invalid token');
      }

      const expireEpochInSeconds = payload.exp ?? 0;
      const expireDate = new Date(expireEpochInSeconds * 1000); //From Seconds to Milliseconds

      if (expireDate <= new Date()) {
        throw new Error('Expired token');
      }

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
