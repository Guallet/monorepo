export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface LoggingConfig {
  level: string;
}

export interface SocialProviderConfig {
  clientId: string;
  clientSecret: string;
}

export interface AuthConfig {
  secret: string;
  baseUrl: string;
  allowedOrigins: string[];
  socialProviders?: {
    google?: SocialProviderConfig;
  };
}

export interface NordigenConfig {
  secretId: string;
  secretKey: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface EmailConfig {
  from: string;
  smtp: {
    host: string;
    port: number;
    user?: string;
    pass?: string;
    secure: boolean;
  };
}

export interface AiConfig {
  credentialsEncryptionKey: string;
}

export interface AppConfig {
  environment: string;
  database: DatabaseConfig;
  logging: LoggingConfig;
  auth: AuthConfig;
  nordigen: NordigenConfig;
  redis: RedisConfig;
  email: EmailConfig;
  ai: AiConfig;
}

const configuration = (): AppConfig => ({
  environment: process.env.ENVIRONMENT || process.env.NODE_ENV || 'production',
  database: {
    host: process.env.DATABASE_HOST || '',
    port: Number.parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || '',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || '',
    ssl: process.env.DATABASE_SSL_ENABLED === 'true',
  },
  logging: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  },
  auth: {
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
  nordigen: {
    secretId: process.env.NORDIGEN_SECRET_ID || '',
    secretKey: process.env.NORDIGEN_SECRET_KEY || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  email: {
    from: process.env.EMAIL_FROM || 'Guallet <noreply@guallet.io>',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: Number.parseInt(process.env.SMTP_PORT || '465'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      secure: process.env.SMTP_SECURE !== 'false',
    },
  },
  ai: {
    credentialsEncryptionKey:
      process.env.DATABASE_CREDENTIALS_ENCRYPTION_KEY || '',
  },
});
export default configuration;
