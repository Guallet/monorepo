import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AccountsModule } from './accounts/accounts.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { HttpLoggerMiddleware } from './core/middleware/http-logger.middleware';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RulesModule } from './rules/rules.module';
import { ReportsModule } from './reports/reports.module';
import { OpenbankingModule } from './openbanking/openbanking.module';
import { NordigenModule } from './nordigen/nordigen.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { AuthGuard } from './core/auth/auth.guard';
import configuration from './configuration';
import { UsersService } from './users/users.service';
import { User } from './users/entities/user.entity';
import { BudgetsModule } from './budgets/budgets.module';

@Module({
  imports: [
    // CONFIG AND ENVIRONMENT
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
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
                ...(config.get<boolean>('logging.axiom.isEnabled')
                  ? [
                      {
                        target: '@axiomhq/pino',
                        options: {
                          dataset: config.get<string>('logging.axiom.dataset'),
                          token: config.get<string>('logging.axiom.token'),
                        },
                      },
                    ]
                  : []),
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
