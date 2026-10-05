import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { databaseOptions } from './options';

export default new DataSource({
  ...databaseOptions(process.env),
  migrations: [join(__dirname, 'migrations', '*.js')],
});
