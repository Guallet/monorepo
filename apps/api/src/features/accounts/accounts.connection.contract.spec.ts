import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { OpenbankingService } from '../openbanking/openbanking.service';
import { TransactionsService } from '../transactions/transactions.service';

describe('account connection HTTP contract', () => {
  const accountId = '00000000-0000-4000-8000-000000000001';
  const connections = { getConnectionFoGualletAccount: vi.fn() };
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        { provide: AccountsService, useValue: {} },
        { provide: TransactionsService, useValue: {} },
        { provide: OpenbankingService, useValue: connections },
      ],
    }).compile();
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
  beforeEach(() => vi.clearAllMocks());

  it.each(['connected', 'expired', 'connectionError'] as const)(
    'returns flat %s details',
    async (status) => {
      const expected = {
        id: '00000000-0000-4000-8000-000000000002',
        providerId: 'synci',
        remoteAccountId: 'remote-account',
        lastRefresh: '2026-11-07T10:00:00.000Z',
        daysRemaining: null,
        status,
      };
      connections.getConnectionFoGualletAccount.mockResolvedValue({
        ...expected,
        lastRefresh: new Date(expected.lastRefresh!),
      });
      const response = await request(app.getHttpServer())
        .get(`/accounts/${accountId}/connection`)
        .expect(200);
      expect(response.body).toEqual(expected);
      expect(response.body).not.toHaveProperty('connection');
      expect(connections.getConnectionFoGualletAccount).toHaveBeenCalledWith(
        'owner',
        accountId,
      );
    },
  );
  it('returns an empty object for an unlinked account', async () => {
    connections.getConnectionFoGualletAccount.mockResolvedValue(null);
    const response = await request(app.getHttpServer())
      .get(`/accounts/${accountId}/connection`)
      .expect(200);
    expect(response.body).toEqual({});
  });
  it('documents both the flat details and empty response in OpenAPI', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    expect(
      document.paths['/accounts/{id}/connection'].get?.responses['200'],
    ).toMatchObject({
      content: {
        'application/json': {
          schema: {
            oneOf: [
              { $ref: '#/components/schemas/AccountConnectionDto' },
              { type: 'object', additionalProperties: false, maxProperties: 0 },
            ],
          },
        },
      },
    });
  });
});
