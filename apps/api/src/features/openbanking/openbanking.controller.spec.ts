import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { OpenbankingController } from './openbanking.controller';
import { OpenbankingService } from './openbanking.service';

const connectionId = '00000000-0000-4000-8000-000000000001';
const jobId = '00000000-0000-4000-8000-000000000002';
const base = `/openbanking/connections/${connectionId}`;
const sensitive = {
  apiKey: 'EXPOSE-ME',
  secretKey: 'EXPOSE-ME',
  encrypted_credentials: 'EXPOSE-ME',
  credentialVersion: 123,
  user_id: 'private-owner',
  raw: { privateBankData: 'EXPOSE-ME' },
};
const account = {
  ...sensitive,
  id: 'remote',
  name: 'Current account',
  institutionName: 'Bank',
  currency: 'GBP',
  linkedAccountId: 'local',
};
const expectedAccount = {
  id: 'remote',
  name: 'Current account',
  institutionName: 'Bank',
  currency: 'GBP',
  linkedAccountId: 'local',
};
const connection = {
  ...sensitive,
  id: connectionId,
  provider_id: 'synci',
  accounts: [account],
  accounts_refreshed_at: null,
  last_synced_at: null,
  last_error: { providerResponse: sensitive },
};
const details = { ...sensitive, connection, credentialHint: '1234' };
const expectedConnection = {
  id: connectionId,
  providerId: 'synci',
  status: 'configured',
  credentialHint: '1234',
  accountsRefreshedAt: null,
  lastSyncedAt: null,
};
const credentials = { apiKey: 'request-secret' };
const authorizationRequest = {
  institutionId: 'bank',
  redirectUrl: 'https://app.example/callback',
};

describe('Openbanking controller response boundary', () => {
  let app: INestApplication<Server>;
  const service = {
    providers: vi.fn().mockReturnValue([
      {
        ...sensitive,
        id: 'synci',
        name: 'Synci',
        supportsBankAuthorization: false,
        supportedCountries: ['GB'],
        credentialFields: [{ ...sensitive, name: 'apiKey', secret: true }],
      },
    ]),
    list: vi.fn().mockResolvedValue([details]),
    get: vi.fn().mockResolvedValue(details),
    create: vi.fn().mockResolvedValue(details),
    replaceCredentials: vi.fn().mockResolvedValue(details),
    accounts: vi.fn().mockResolvedValue({
      ...sensitive,
      accounts: [account],
      refreshedAt: null,
    }),
    enqueue: vi.fn().mockResolvedValue({ ...sensitive, jobId }),
    completeAuthorization: vi.fn().mockResolvedValue({ ...sensitive, jobId }),
    jobStatus: vi.fn(),
    institutions: vi
      .fn()
      .mockResolvedValue([
        { ...sensitive, id: 'bank', name: 'Bank', logo: null },
      ]),
    authorize: vi.fn().mockResolvedValue({
      ...sensitive,
      id: jobId,
      action: 'redirect',
      redirectUrl: 'https://bank.example/consent',
    }),
    remove: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [OpenbankingController],
      providers: [{ provide: OpenbankingService, useValue: service }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication<INestApplication<Server>>({
      logger: false,
    });
    app.use((req, _res, next) => {
      req.session = { user: { id: 'owner', email: 'owner@example.test' } };
      next();
    });
    await app.listen(0, '127.0.0.1');
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    service.jobStatus.mockResolvedValue({
      ...sensitive,
      status: 'completed',
      operation: 'sync',
      result: { ...sensitive, accountsSynced: 1, errors: [] },
    });
  });

  const cases = [
    {
      method: 'get',
      path: '/openbanking/providers',
      status: 200,
      expected: [
        {
          id: 'synci',
          name: 'Synci',
          supportsBankAuthorization: false,
          supportedCountries: ['GB'],
          credentialFields: [{ name: 'apiKey', secret: true }],
        },
      ],
    },
    {
      method: 'get',
      path: '/openbanking/connections',
      status: 200,
      expected: [expectedConnection],
    },
    { method: 'get', path: base, status: 200, expected: expectedConnection },
    {
      method: 'post',
      path: '/openbanking/connections',
      status: 201,
      body: { providerId: 'synci', credentials },
      expected: expectedConnection,
    },
    {
      method: 'put',
      path: `${base}/credentials`,
      status: 200,
      body: { credentials },
      expected: expectedConnection,
    },
    {
      method: 'get',
      path: `${base}/accounts`,
      status: 200,
      expected: { accounts: [expectedAccount], refreshedAt: null },
    },
    {
      method: 'post',
      path: `${base}/accounts/refresh`,
      status: 202,
      expected: { jobId },
    },
    {
      method: 'post',
      path: `${base}/accounts/import`,
      status: 202,
      body: { accountIds: ['remote'] },
      expected: { jobId },
    },
    { method: 'post', path: `${base}/sync`, status: 202, expected: { jobId } },
    {
      method: 'get',
      path: `${base}/jobs/${jobId}`,
      status: 200,
      expected: {
        status: 'completed',
        operation: 'sync',
        result: { accountsSynced: 1, errors: [] },
      },
    },
    {
      method: 'get',
      path: `${base}/institutions?country=GB`,
      status: 200,
      expected: [{ id: 'bank', name: 'Bank', logo: null }],
    },
    {
      method: 'post',
      path: `${base}/authorizations`,
      status: 201,
      body: authorizationRequest,
      expected: {
        id: jobId,
        action: 'redirect',
        redirectUrl: 'https://bank.example/consent',
      },
    },
    {
      method: 'post',
      path: `${base}/authorizations/${jobId}/complete`,
      status: 202,
      expected: { jobId },
    },
  ] as const;

  it.each(cases)(
    'serializes only public DTO fields for $method $path',
    async (testCase) => {
      const call = request(app.getHttpServer())[testCase.method](testCase.path);
      if ('body' in testCase) call.send(testCase.body);
      const response = await call.expect(testCase.status);
      expect(response.body).toEqual(testCase.expected);
      expect(JSON.stringify(response.body)).not.toContain('EXPOSE-ME');
      expect(JSON.stringify(response.body)).not.toContain('private-owner');
    },
  );

  it('maps failed jobs without exposing provider errors or partial results', async () => {
    service.jobStatus.mockResolvedValue({
      ...sensitive,
      status: 'failed',
      operation: 'sync',
      error: 'EXPOSE-ME',
      result: { accountsSynced: 1, raw: sensitive },
    });
    const response = await request(app.getHttpServer())
      .get(`${base}/jobs/${jobId}`)
      .expect(200);
    expect(response.body).toEqual({
      status: 'failed',
      operation: 'sync',
      error:
        'The operation failed. Check your provider connection and try again.',
    });
  });

  it('passes domain inputs and scopes create and authorization to the signed-in user', async () => {
    await request(app.getHttpServer())
      .post('/openbanking/connections')
      .send({ providerId: 'synci', credentials })
      .expect(201);
    expect(service.create).toHaveBeenCalledWith({
      userId: 'owner',
      input: { providerId: 'synci', credentials },
    });
    await request(app.getHttpServer())
      .post(`${base}/authorizations`)
      .send(authorizationRequest)
      .expect(201);
    expect(service.authorize).toHaveBeenCalledWith({
      userId: 'owner',
      id: connectionId,
      input: authorizationRequest,
    });
  });

  it.each([base, `${base}/accounts/remote/link`])(
    'returns no body for deletion of %s',
    async (path) => {
      const response = await request(app.getHttpServer())
        .delete(path)
        .expect(204);
      expect(response.text).toBe('');
    },
  );
});
