import { z } from 'zod';

export const databaseEnvironmentSchema = z.object({
  DATABASE_HOST: z.string().min(1).default('localhost'),
  DATABASE_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_SSL_ENABLED: z.preprocess((value) => {
    if (value === '' || value === undefined) return false;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }, z.boolean()),
});
