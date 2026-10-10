import 'dotenv/config';
import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

// This is only for TypeORM migration CLI scripts. Nest runtime database
// config is in AppModule. Run CLI commands from apps/api after building.
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl:
    process.env.DATABASE_SSL_ENABLED === 'true'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: false,
  migrationsRun: false,
  installExtensions: false,
  entities: [join(__dirname, '../features/**/entities/*.entity.js')],
  migrations: [join(__dirname, '../migrations/*.js')],
});
