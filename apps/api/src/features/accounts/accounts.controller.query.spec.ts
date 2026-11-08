import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { OpenbankingService } from '../openbanking/openbanking.service';
import { TransactionsService } from '../transactions/transactions.service';

describe('account chart HTTP query validation', () => {
  const accountId = '00000000-0000-4000-8000-000000000001';
  const accounts = { getUserAccount: vi.fn() };
  const transactions = {
    getAccountTransactions: vi.fn(),
    getAccountTransactionsSum: vi.fn(),
  };
  let app: INestApplication<Server>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        { provide: AccountsService, useValue: accounts },
        { provide: TransactionsService, useValue: transactions },
        { provide: OpenbankingService, useValue: {} },
      ],
    }).compile();
    app = module.createNestApplication<INestApplication<Server>>({
      logger: false,
    });
    app.use((req, _res, next) => {
      req.session = { user: { id: 'owner', email: 'owner@example.test' } };
      next();
    });
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    accounts.getUserAccount.mockResolvedValue({ id: accountId, balance: 100 });
    transactions.getAccountTransactions.mockResolvedValue([]);
    transactions.getAccountTransactionsSum.mockResolvedValue(0);
  });

  it('passes parsed dates to the service', async () => {
    await request(app.getHttpServer())
      .get(`/accounts/${accountId}/charts`)
      .query({ startDate: '2026-10-01', endDate: '2026-10-31' })
      .expect(200);
    expect(accounts.getUserAccount).toHaveBeenCalledWith('owner', accountId);
    expect(transactions.getAccountTransactions).toHaveBeenCalledWith({
      accountId,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
    });
  });
  it('provides defaults when date queries are absent', async () => {
    await request(app.getHttpServer())
      .get(`/accounts/${accountId}/charts`)
      .expect(200);
    expect(transactions.getAccountTransactions).toHaveBeenCalledWith({
      accountId,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
  });
  it.each([
    'startDate=not-a-date',
    'endDate=not-a-date',
    'startDate=2026-11-07&endDate=2026-10-01',
    'startDate=2026-10-01&startDate=2026-10-02',
  ])('returns HTTP 400 before querying services: %s', async (query) => {
    await request(app.getHttpServer())
      .get(`/accounts/${accountId}/charts?${query}`)
      .expect(400);
    expect(accounts.getUserAccount).not.toHaveBeenCalled();
    expect(transactions.getAccountTransactions).not.toHaveBeenCalled();
  });
});
