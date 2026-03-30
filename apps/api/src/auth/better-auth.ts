import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { AuthConfig, DatabaseConfig } from 'src/configuration';
import { emailOTP, magicLink } from 'better-auth/plugins';
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
    trustedOrigins: [...authConfig.allowedOrigins],
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
    sessions: {
      modelName: 'auth_sessions',
    },
    account: {
      modelName: 'auth_accounts',
    },
    // AUTH CONFIG
    secret: authConfig.secret,
    session: {
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
            eventEmitter?.emit('user.created', { userId: user.id });
            return await Promise.resolve();
          },
        },
      },
    },
    // AUTH METHODS
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      sendResetPassword: ({ user, url }) => {
        eventEmitter?.emit('auth.email.password-reset', {
          to: user.email,
          url,
          userName: user.name,
        });
        return Promise.resolve();
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
      emailOTP({
        // OTP will expire after 5 minutes
        expiresIn: 60 * 5,
        sendVerificationOTP: ({ email, otp, type }) => {
          eventEmitter?.emit('auth.email.otp', { to: email, otp, type });
          return Promise.resolve();
        },
      }),
      magicLink({
        // Magic link will expire after 10 minutes
        expiresIn: 60 * 10,
        sendMagicLink: ({ email, url }) => {
          eventEmitter?.emit('auth.email.magic-link', { to: email, url });
          return Promise.resolve();
        },
      }),
    ],
  });
};

// This export is specifically for the Better Auth CLI to handle migrations
// It uses process.env because the CLI runs outside the NestJS context
export const auth = createAuth({
  databaseConfig: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'guallet',
    ssl: process.env.DATABASE_SSL_ENABLED === 'true',
  },
  authConfig: {
    secret: process.env.BETTER_AUTH_SECRET || '',
    baseUrl: process.env.BETTER_AUTH_BASE_URL || '',
    allowedOrigins: (process.env.ALLOWED_CORS_ORIGINS ?? '').split(','),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
    },
  },
});
