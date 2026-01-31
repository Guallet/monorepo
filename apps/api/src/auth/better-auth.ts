import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { AuthConfig, DatabaseConfig } from 'src/configuration';

export const createAuth = ({
  databaseConfig,
  authConfig,
}: {
  databaseConfig: DatabaseConfig;
  authConfig: AuthConfig;
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
    // AUTH METHODS
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
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
  },
});
