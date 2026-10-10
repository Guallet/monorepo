import 'dotenv/config';
import { createAuth } from './better-auth';

// The Better Auth CLI loads this module directly, outside Nest's ConfigModule.
// Keep its environment-backed instance separate from the API runtime module.
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
