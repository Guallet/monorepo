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
import configuration from './configuration';
import { User } from './features/users/entities/user.entity';
import { BudgetsModule } from './features/budgets/budgets.module';
import { WebhooksModule } from './features/webhooks/webhooks.module';
import { WaitingListModule } from './features/waitinglist/waitinglist.module';
import { SavingGoalsModule } from './features/saving-goals/saving-goals.module';
import { RegularPaymentsModule } from './features/regular-payments/regular-payments.module';
import { DataImporterModule } from './features/data-importer/data-importer.module';
import { DataExporterModule } from './features/data-exporter/data-exporter.module';
import { EmailModule } from './features/email/email.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import * as Joi from 'joi';
import { BullModule } from '@nestjs/bullmq';
import { HealthModule } from './features/health/health.module';
import { UsersService } from './features/users/users.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/better-auth';
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
      useFactory: (config: ConfigService) => {
        return {
          exclude: [{ method: RequestMethod.POST, path: '/graphql' }],
          pinoHttp: {
            autoLogging: false,
            level: config.get<string>('logging.level'),
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [],
      // synchronize: process.env.ENVIRONMENT === 'development',
      synchronize: true,
      autoLoadEntities: true,
      ssl:
        process.env.DATABASE_SSL_ENABLED === 'true'
          ? { rejectUnauthorized: false }
          : false,
    }),
    // AUTHENTICATION VIA BETTER-AUTH
    AuthModule.forRoot({ auth: auth }),
    // CRON
    ScheduleModule.forRoot(),
    // REDIS / BULL
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
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
    WaitingListModule,
    SavingGoalsModule,
    DataImporterModule,
    DataExporterModule,
    EmailModule,
    NotificationsModule,
    // UGLY HACK TO GET THE USER REPOSITORY IN THE AUTH GUARD
    TypeOrmModule.forFeature([User]),
    RegularPaymentsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [UsersService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .exclude({ path: '/graphql', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
