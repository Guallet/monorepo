import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { createAuth } from '../../auth/better-auth';

/** Use Better Auth's public server API; the handoff never creates or signs its own sessions. */
@Injectable()
export class NativeAuthGateway {
  constructor(
    private readonly auth: AuthService<ReturnType<typeof createAuth>>,
  ) {}

  async startGoogle({
    callbackURL,
  }: {
    callbackURL: string;
  }): Promise<{ url: string; cookies: string[] }> {
    const response = await this.auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL,
        errorCallbackURL: callbackURL,
        disableRedirect: true,
      },
      asResponse: true,
    });
    if (!response.ok)
      throw new BadRequestException('Could not start Google sign-in.');
    const body = (await response.json()) as { url?: string };
    if (!body.url || new URL(body.url).protocol !== 'https:')
      throw new BadRequestException('Invalid provider redirect.');
    return { url: body.url, cookies: response.headers.getSetCookie() };
  }

  async requestReset({
    email,
    redirectTo,
  }: {
    email: string;
    redirectTo: string;
  }) {
    await this.auth.api.requestPasswordReset({ body: { email, redirectTo } });
  }
  async resetPassword({
    token,
    newPassword,
  }: {
    token: string;
    newPassword: string;
  }) {
    await this.auth.api.resetPassword({ body: { token, newPassword } });
  }
}
