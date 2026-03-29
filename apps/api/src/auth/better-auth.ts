import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { AuthConfig, DatabaseConfig } from 'src/configuration';
import { emailOTP, magicLink } from 'better-auth/plugins';
import { EmailService } from 'src/features/email/email.service';

export const createAuth = ({
  databaseConfig,
  authConfig,
  emailService,
}: {
  databaseConfig: DatabaseConfig;
  authConfig: AuthConfig;
  emailService: EmailService;
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
    // AUTH METHODS
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      sendResetPassword: async ({ user, url }) => {
        await emailService.sendPasswordResetEmail({
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
      emailOTP({
        // OTP will expire after 5 minutes
        expiresIn: 60 * 5,
        // Send OTP via email using EmailService
        sendVerificationOTP: async ({ email, otp, type }) => {
          await emailService.sendAuthOtpEmail({
            to: email,
            otp,
            type,
          });
        },
      }),
      magicLink({
        // Magic link will expire after 10 minutes
        expiresIn: 60 * 10,
        // Send magic link via email using EmailService
        sendMagicLink: async ({ email, url }) => {
          await emailService.sendAuthMagicLinkEmail({
            to: email,
            url,
          });
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
  // Note: Email service is mocked here since the CLI runs outside NestJS
  emailService: {
    sendAuthOtpEmail: () => {
      return Promise.resolve();
    },
    sendAuthMagicLinkEmail: () => {
      return Promise.resolve();
    },
  } as unknown as EmailService,
});
