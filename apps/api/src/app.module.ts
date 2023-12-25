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
import { JwtService } from '@nestjs/jwt';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RulesModule } from './rules/rules.module';
import { ReportsModule } from './reports/reports.module';
import { OpenbankingModule } from './openbanking/openbanking.module';
import { NordigenModule } from './nordigen/nordigen.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { AuthGuard } from './core/auth/auth.guard';
import * as SuperTokensConfig from './core/auth/supertokens.config';

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
    // Supertokens config
    AuthModule.forRoot({
      connectionURI: process.env.SUPERTOKENS_CONNECTION_URI,
      apiKey: process.env.SUPERTOKENS_API_KEY,
      appInfo: SuperTokensConfig.appInfo,
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
    // This will protect all the routes using the AuthGuard
    // If you want to allow a specific route, sue the @Public decorator
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
