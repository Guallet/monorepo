import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

// Factory function to create Better Auth instance
export function createBetterAuth(configService: ConfigService) {
  const pool = new Pool({
    host:
      configService.get<string>('database.host') || process.env.DATABASE_HOST,
    port:
      configService.get<number>('database.port') ||
      Number(process.env.DATABASE_PORT),
    user:
      configService.get<string>('database.username') ||
      process.env.DATABASE_USERNAME,
    password:
      configService.get<string>('database.password') ||
      process.env.DATABASE_PASSWORD,
    database:
      configService.get<string>('database.name') || process.env.DATABASE_NAME,
    ssl: { rejectUnauthorized: false },
  });

  return betterAuth({
    database: pool,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
    },
    // Configure session and token options
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
  });
}

export type Auth = ReturnType<typeof createBetterAuth>;
