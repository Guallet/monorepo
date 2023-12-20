import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AccountsModule } from './accounts/accounts.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpLoggerMiddleware } from './core/middleware/http-logger.middleware';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './core/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RulesModule } from './rules/rules.module';
import { ReportsModule } from './reports/reports.module';
import { OpenbankingModule } from './openbanking/openbanking.module';
import { NordigenModule } from './nordigen/nordigen.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // CONFIG AND ENVIRONMENT
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
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
    // GRAPHQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
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
  ],
  controllers: [],
  providers: [
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
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
