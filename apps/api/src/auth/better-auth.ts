import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { AuthConfig, DatabaseConfig } from 'src/configuration';
import { emailOTP, magicLink } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const createAuth = ({
  databaseConfig,
  authConfig,
  eventEmitter,
}: {
  databaseConfig: DatabaseConfig;
  authConfig: AuthConfig;
  eventEmitter?: EventEmitter2;
}) => {
  const database = new Pool({
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : false,
  });

  return betterAuth({
    appName: 'Guallet',
    // Native Expo requests use this origin while the Expo plugin proxies OAuth
    // callbacks back to the app's custom URL scheme.
    trustedOrigins: [...new Set([...authConfig.allowedOrigins, 'guallet://'])],
    basePath: '/auth',
    baseURL: authConfig.baseUrl,
    // DATABASE CONFIG
    database: database,
    user: {
      modelName: 'users',
      fields: {
        id: 'id',
        email: 'email',
        emailVerified: 'email_verified',
        name: 'name',
        image: 'profile_image_url',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    account: {
      modelName: 'auth_accounts',
    },
    // AUTH CONFIG
    secret: authConfig.secret,
    session: {
      modelName: 'session',
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    // ADVANCED CONFIG
    // The webapp and API are on different domains (cross-origin). The OAuth state
    // cookie must use SameSite=None so browsers allow it to be set and sent
    // during the cross-origin OAuth flow.
    // This should be updated to SameSite=Lax if the webapp and API are ever served from the same domain.
    advanced: {
      useSecureCookies: true,
      cookies: {
        state: {
          attributes: {
            sameSite: 'none',
            secure: true,
          },
        },
        session_token: {
          attributes: {
            sameSite: 'none',
            secure: true,
          },
        },
      },
    },
    // LIFECYCLE HOOKS
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await eventEmitter?.emitAsync('user.created', {
              userId: user.id,
              email: user.email,
              userName: user.name,
            });
          },
        },
      },
    },
    // AUTH METHODS
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      sendResetPassword: async ({ user, url }) => {
        await eventEmitter?.emitAsync('auth.email.password-reset', {
          to: user.email,
          url,
          userName: user.name,
        });
      },
    },
    socialProviders: {
      google: {
        enabled: authConfig.socialProviders?.google !== undefined,
        clientId: authConfig.socialProviders?.google?.clientId || '',
        clientSecret: authConfig.socialProviders?.google?.clientSecret || '',
      },
    },
    // PLUGINS
    plugins: [
      expo(),
      emailOTP({
        // OTP will expire after 5 minutes
        expiresIn: 60 * 5,
        sendVerificationOTP: async ({ email, otp, type }) => {
          await eventEmitter?.emitAsync('auth.email.otp', {
            to: email,
            otp,
            type,
          });
        },
      }),
      magicLink({
        // Magic link will expire after 10 minutes
        expiresIn: 60 * 10,
        sendMagicLink: async ({ email, url }) => {
          await eventEmitter?.emitAsync('auth.email.magic-link', {
            to: email,
            url,
          });
        },
      }),
    ],
  });
};
