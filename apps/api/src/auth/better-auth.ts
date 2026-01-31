import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

// TODO: Ensure this is the same configuration as in the Database module
const database = new Pool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl:
    process.env.DATABASE_SSL_ENABLED === 'true'
      ? { rejectUnauthorized: false }
      : false,
});

export const auth = betterAuth({
  database: database,
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  //   socialProviders: {
  //     google: {
  //       clientId: process.env.GOOGLE_CLIENT_ID || '',
  //       clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  //     },
  //   },
});
