import { databaseEnvironmentSchema } from './environment';
import type { DataSourceOptions } from 'typeorm';
import { databaseEntities } from './entities';

export const databaseOptions = (
  environment: NodeJS.ProcessEnv,
): Extract<DataSourceOptions, { type: 'postgres' }> => {
  const config = databaseEnvironmentSchema.parse(environment);
  return {
    type: 'postgres',
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    username: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD,
    database: config.DATABASE_NAME,
    schema: 'public',
    installExtensions: false,
    ssl: config.DATABASE_SSL_ENABLED ? { rejectUnauthorized: false } : false,
    entities: databaseEntities,
    synchronize: false,
    migrationsRun: false,
    migrationsTableName: 'typeorm_migrations',
  };
};
