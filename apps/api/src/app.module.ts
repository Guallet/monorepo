import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
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
import { AuthGuard } from './auth/auth.guard';
import configuration from './configuration';
import { UsersService } from './features/users/users.service';
import { User } from './features/users/entities/user.entity';
import { BudgetsModule } from './features/budgets/budgets.module';
import { WebhooksModule } from './features/webhooks/webhooks.module';
import { WaitingListModule } from './features/waitinglist/waitinglist.module';
import * as Joi from 'joi';

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
        DATABASE_URL: Joi.string().required(),
        NORDIGEN_SECRET_ID: Joi.string().required(),
        NORDIGEN_SECRET_KEY: Joi.string().required(),
      }),
    }),
    // LOGGING
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
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
      url: process.env.DATABASE_URL,
      entities: [],
      synchronize: process.env.ENVIRONMENT == 'development',
      autoLoadEntities: true,
      ssl: { rejectUnauthorized: false },
    }),
    // CRON
    ScheduleModule.forRoot(),
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
    // UGLY HACK TO GET THE USER REPOSITORY IN THE AUTH GUARD
    TypeOrmModule.forFeature([User]),
    WebhooksModule,
    WaitingListModule,
  ],
  controllers: [],
  providers: [
    JwtService,
    // This will protect all the routes using the AuthGuard
    // If you want to allow a specific route, sue the @Public decorator
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    UsersService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .exclude({ path: '/graphql', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
