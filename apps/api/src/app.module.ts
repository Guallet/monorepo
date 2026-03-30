import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AccountsModule } from './features/accounts/accounts.module';
import { InstitutionsModule } from './features/institutions/institutions.module';
import { HttpLoggerMiddleware } from './middleware/http-logger.middleware';
import { CategoriesModule } from './features/categories/categories.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { RulesModule } from './features/rules/rules.module';
import { ReportsModule } from './features/reports/reports.module';
import { OpenbankingModule } from './features/openbanking/openbanking.module';
import { NordigenModule } from './features/nordigen/nordigen.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './features/users/users.module';
import configuration, { AppConfig } from './configuration';
import { BudgetsModule } from './features/budgets/budgets.module';
import { WebhooksModule } from './features/webhooks/webhooks.module';
import { SavingGoalsModule } from './features/saving-goals/saving-goals.module';
import { RegularPaymentsModule } from './features/regular-payments/regular-payments.module';
import { DataImporterModule } from './features/data-importer/data-importer.module';
import { DataExporterModule } from './features/data-exporter/data-exporter.module';
import { EmailModule } from './features/email/email.module';
import { EmailService } from './features/email/email.service';
import { NotificationsModule } from './features/notifications/notifications.module';
import * as Joi from 'joi';
import { BullModule } from '@nestjs/bullmq';
import { HealthModule } from './features/health/health.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './auth/better-auth';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { AppController } from './app.controller';

@Module({
  imports: [
    // CONFIG AND ENVIRONMENT
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
      cache: true,
      validationSchema: Joi.object({
        ENVIRONMENT: Joi.string()
          .valid('development', 'production')
          .default('development'),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_SSL_ENABLED: Joi.boolean().default(false),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
        BETTER_AUTH_SECRET: Joi.string().required(),
        BETTER_AUTH_BASE_URL: Joi.string().required(),
        NORDIGEN_SECRET_ID: Joi.string().required(),
        NORDIGEN_SECRET_KEY: Joi.string().required(),
      }),
    }),
    // LOGGING
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => {
        return {
          exclude: [{ method: RequestMethod.POST, path: '/graphql' }],
          pinoHttp: {
            autoLogging: false,
            level: config.get('logging', { infer: true })?.level,
            redact: ['req.headers.authorization', 'req.headers.cookie'],
            transport: {
              targets: [
                {
                  target: 'pino-pretty',
                },
              ],
            },
          },
        };
      },
    }),
    // DATABASE
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const dbConfig = configService.get('database', { infer: true })!;
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [],
          synchronize: true,
          autoLoadEntities: true,
          ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    // EVENTS
    EventEmitterModule.forRoot(),
    // AUTHENTICATION VIA BETTER-AUTH
    AuthModule.forRootAsync({
      imports: [ConfigModule, EmailModule],
      inject: [ConfigService, EmailService, EventEmitter2],
      useFactory: (
        configService: ConfigService<AppConfig>,
        emailService: EmailService,
        eventEmitter: EventEmitter2,
      ) => {
        const database = configService.get('database', { infer: true })!;
        const authConfig = configService.get('auth', { infer: true })!;

        return {
          auth: createAuth({
            databaseConfig: database,
            authConfig: authConfig,
            emailService: emailService,
            eventEmitter: eventEmitter,
          }),
        };
      },
    }),
    // CRON
    ScheduleModule.forRoot(),
    // REDIS / BULL
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const redisConfig = configService.get('redis', { infer: true })!;
        return {
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
          },
        };
      },
    }),
    // APP MODULES
    UsersModule,
    InstitutionsModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    RulesModule,
    ReportsModule,
    OpenbankingModule,
    NordigenModule,
    AdminModule,
    BudgetsModule,
    WebhooksModule,
    SavingGoalsModule,
    DataImporterModule,
    DataExporterModule,
    EmailModule,
    NotificationsModule,
    RegularPaymentsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .exclude({ path: '/graphql', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
