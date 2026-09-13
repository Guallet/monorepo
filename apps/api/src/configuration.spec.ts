import { environmentSchema, parseEnvironment } from './configuration';

const validEnvironment = {
  ENVIRONMENT: 'production',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5433',
  DATABASE_USERNAME: 'guallet',
  DATABASE_PASSWORD: 'password',
  DATABASE_NAME: 'guallet',
  DATABASE_SSL_ENABLED: 'true',
  REDIS_HOST: 'redis',
  REDIS_PORT: '6380',
  REDIS_PASSWORD: '',
  BETTER_AUTH_SECRET: 'auth-secret',
  BETTER_AUTH_BASE_URL: 'http://localhost:5000',
  NORDIGEN_SECRET_ID: 'secret-id',
  NORDIGEN_SECRET_KEY: 'secret-key',
  DATABASE_CREDENTIALS_ENCRYPTION_KEY: 'encryption-key',
  NESTJS_OBSERVE_APP_KEY: '',
  NESTJS_OBSERVE_APP_SECRET: '',
  NESTJS_OBSERVE_SERVICE_ID: '',
  UNDECLARED_VARIABLE: 'preserved',
};

describe('environment configuration', () => {
  it('coerces supported environment values and preserves unknown values', () => {
    const parsed = parseEnvironment(validEnvironment);

    expect(parsed.DATABASE_PORT).toBe(5433);
    expect(parsed.DATABASE_SSL_ENABLED).toBe(true);
    expect(parsed.REDIS_PORT).toBe(6380);
    expect((parsed as Record<string, unknown>).UNDECLARED_VARIABLE).toBe(
      'preserved',
    );
  });

  it('applies defaults', () => {
    const environment: NodeJS.ProcessEnv = { ...validEnvironment };
    delete environment.ENVIRONMENT;
    delete environment.DATABASE_SSL_ENABLED;
    delete environment.REDIS_PORT;

    const parsed = parseEnvironment(environment);

    expect(parsed.ENVIRONMENT).toBe('development');
    expect(parsed.DATABASE_SSL_ENABLED).toBe(false);
    expect(parsed.REDIS_PORT).toBe(6379);
  });

  it('applies defaults to empty environment values', () => {
    const parsed = parseEnvironment({
      ...validEnvironment,
      DATABASE_SSL_ENABLED: '',
      REDIS_PORT: '',
    });

    expect(parsed.DATABASE_SSL_ENABLED).toBe(false);
    expect(parsed.REDIS_PORT).toBe(6379);
  });

  it('allows empty optional values', () => {
    const parsed = parseEnvironment(validEnvironment);

    expect(parsed.REDIS_PASSWORD).toBe('');
    expect(parsed.NESTJS_OBSERVE_APP_KEY).toBe('');
    expect(parsed.NESTJS_OBSERVE_APP_SECRET).toBe('');
    expect(parsed.NESTJS_OBSERVE_SERVICE_ID).toBe('');
  });

  it.each([
    ['DATABASE_HOST', ''],
    ['DATABASE_PORT', 'not-a-number'],
    ['DATABASE_SSL_ENABLED', 'not-a-boolean'],
    ['ENVIRONMENT', 'test'],
  ])('rejects invalid %s values', (key, value) => {
    const result = environmentSchema.safeParse({
      ...validEnvironment,
      [key]: value,
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: [key] })]),
    );
  });

  it('rejects missing required values', () => {
    const environment: NodeJS.ProcessEnv = { ...validEnvironment };
    delete environment.DATABASE_CREDENTIALS_ENCRYPTION_KEY;

    const result = environmentSchema.safeParse(environment);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['DATABASE_CREDENTIALS_ENCRYPTION_KEY'],
        }),
      ]),
    );
  });
});
