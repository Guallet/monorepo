import { version } from '../package.json';
import { z } from 'zod';

/**
 * Environment variables validated by ConfigModule before the configuration
 * factory runs. Unknown variables are intentionally preserved to support
 * variables consumed by modules outside this file.
 */
export const environmentSchema = z
  .object({
    DECISION_ALLOW_HTTP: z.enum(['true', 'false']).default('false'),
    DECISION_PRIVATE_TARGETS: z.string().default(''),
    DECISION_ALLOWED_HOSTS: z.string().default(''),
    DECISION_REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(100)
      .max(30000)
      .default(8000),
    DECISION_MAX_QUESTIONS: z.coerce.number().int().min(1).max(24).default(24),
    DECISION_REQUESTS_PER_MINUTE: z.coerce
      .number()
      .int()
      .min(1)
      .max(120)
      .default(60),
    ENVIRONMENT: z.enum(['development', 'production']).default('development'),
    DATABASE_HOST: z.string().min(1).default('localhost'),
    DATABASE_PORT: z.coerce.number().default(5432),
    DATABASE_USERNAME: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1),
    DATABASE_NAME: z.string().min(1),
    DATABASE_SSL_ENABLED: z.preprocess((value) => {
      if (value === '') {
        return undefined;
      }

      if (value === 'true') {
        return true;
      }

      if (value === 'false') {
        return false;
      }

      return value;
    }, z.boolean().default(false)),
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.coerce.number().default(6379),
    ),
    REDIS_PASSWORD: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_BASE_URL: z.string().min(1),
    NORDIGEN_SECRET_ID: z.string().min(1),
    NORDIGEN_SECRET_KEY: z.string().min(1),
    DATABASE_CREDENTIALS_ENCRYPTION_KEY: z.string().min(1),
    NESTJS_OBSERVE_APP_KEY: z.string().optional(),
    NESTJS_OBSERVE_APP_SECRET: z.string().optional(),
    NESTJS_OBSERVE_SERVICE_ID: z.string().optional(),
  })
  .loose();

export type EnvironmentConfig = z.output<typeof environmentSchema>;

export const parseEnvironment = (
  environment: NodeJS.ProcessEnv,
): EnvironmentConfig => environmentSchema.parse(environment);

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

export interface NestObserveConfig {
  appKey: string;
  appSecret: string;
  serviceId: string;
  serviceVersion: string;
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
  observe: NestObserveConfig;
  decision: {
    allowHttp: boolean;
    privateTargets: string[];
    allowedHosts: string[];
    timeoutMs: number;
    maxQuestions: number;
    requestsPerMinute: number;
  };
}

const configuration = (): AppConfig => {
  const environment = parseEnvironment(process.env);

  return {
    environment: environment.ENVIRONMENT,
    database: {
      host: environment.DATABASE_HOST,
      port: environment.DATABASE_PORT,
      username: environment.DATABASE_USERNAME,
      password: environment.DATABASE_PASSWORD,
      database: environment.DATABASE_NAME,
      ssl: environment.DATABASE_SSL_ENABLED,
    },
    logging: {
      level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    },
    auth: {
      secret: environment.BETTER_AUTH_SECRET,
      baseUrl: environment.BETTER_AUTH_BASE_URL,
      allowedOrigins: (process.env.ALLOWED_CORS_ORIGINS ?? '').split(','),
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
      },
    },
    nordigen: {
      secretId: environment.NORDIGEN_SECRET_ID,
      secretKey: environment.NORDIGEN_SECRET_KEY,
    },
    redis: {
      host: environment.REDIS_HOST,
      port: environment.REDIS_PORT,
      password: environment.REDIS_PASSWORD || undefined,
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
    decision: {
      allowHttp: environment.DECISION_ALLOW_HTTP === 'true',
      privateTargets: environment.DECISION_PRIVATE_TARGETS.split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      allowedHosts: environment.DECISION_ALLOWED_HOSTS.split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      timeoutMs: environment.DECISION_REQUEST_TIMEOUT_MS,
      maxQuestions: environment.DECISION_MAX_QUESTIONS,
      requestsPerMinute: environment.DECISION_REQUESTS_PER_MINUTE,
    },
    ai: {
      credentialsEncryptionKey: environment.DATABASE_CREDENTIALS_ENCRYPTION_KEY,
    },
    observe: {
      appKey: environment.NESTJS_OBSERVE_APP_KEY ?? '',
      appSecret: environment.NESTJS_OBSERVE_APP_SECRET ?? '',
      serviceId: environment.NESTJS_OBSERVE_SERVICE_ID || 'guallet-api',
      serviceVersion: version,
    },
  };
};
export default configuration;
