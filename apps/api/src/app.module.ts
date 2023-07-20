import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthGuard } from './core/auth/auth.guard';
import { HttpLoggerMiddleware } from './core/middleware/httplogger.middleware';
import { OpenBankingModule } from './openbanking/openbanking.module';
import { NordigenModule } from './nordigen/nordigen.module';
import { AccountModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    // ENV and Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [],
      synchronize: process.env.ENVIRONMENT == 'Development',
      autoLoadEntities: true,
      ssl: { rejectUnauthorized: false },
    }),
    // EVENT BUS
    EventEmitterModule.forRoot(),
    // CRON jobs
    ScheduleModule.forRoot(),
    // App Modules
    OpenBankingModule,
    NordigenModule,
    AccountModule,
    TransactionsModule,
    InstitutionsModule,
    AdminModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
