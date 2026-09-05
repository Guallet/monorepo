/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategorizationRule } from '../src/features/rules/entities/categorization-rule.entity.js';

describe('Rules (e2e)', () => {
  let app: INestApplication;

  const mockRulesRepository = {
    count: vi.fn().mockResolvedValue(1000),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(CategorizationRule))
      .useValue(mockRulesRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    // Mock session user so @RequestUser() can read it
    app.use((req: any, res: any, next: any) => {
      req.session = { user: { id: 'user-1', email: 'test@example.com' } };
      next();
    });

    await app.init();
  });

  it('POST /rules should return 400 when user has too many rules', async () => {
    const dto = {
      name: 'New Rule',
      resultCategoryId: 'cat-1',
      conditions: [
        { field: 'description', operator: 'contains', value: 'x', order: 0 },
      ],
    };

    const res = await request(app.getHttpServer())
      .post('/rules')
      .send(dto)
      .expect(400);
    expect(res.body.message).toContain('Too many rules. Maximum allowed: 1000');
  });

  it('GET /rules/limits should return limits and messages', async () => {
    const res = await request(app.getHttpServer())
      .get('/rules/limits')
      .expect(200);
    expect(res.body).toHaveProperty('maxConditionsPerRule');
    expect(res.body).toHaveProperty('maxRulesPerUser');
    expect(res.body).toHaveProperty('tooManyConditionsMessage');
    expect(res.body).toHaveProperty('tooManyRulesMessage');
    expect(res.body.maxConditionsPerRule).toBeGreaterThan(0);
    expect(res.body.maxRulesPerUser).toBeGreaterThan(0);
  });

  afterEach(async () => {
    await app?.close();
    vi.resetAllMocks();
  });
});
