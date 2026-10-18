const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createServer } = require('node:http');
const { ConfigService } = require('@nestjs/config');
const { default: db } = require('../dist/database/data-source');
const { RulesService } = require('../dist/features/rules/rules.service');
const {
  CategorizationRule,
  RuleCondition,
} = require('../dist/features/rules/entities/categorization-rule.entity');
const {
  Transaction,
} = require('../dist/features/transactions/entities/transaction.entity');
const {
  ClassificationService,
} = require('../dist/features/classification/classification.service');
const {
  DecisionConnectionsService,
} = require('../dist/features/classification/decision-connections.service');
const {
  CredentialEncryptionService,
} = require('../dist/common/crypto/credential-encryption.service');
const {
  JevClient,
} = require('../dist/features/classification/jev-client.service');
const {
  SafeHttpClient,
} = require('../dist/features/classification/http/safe-http-client');
let server, connections, service, base;
let onRequest = async () => {};
let requests = 0;
const users = [];
before(async () => {
  if (!process.env.DATABASE_NAME?.endsWith('_classification_test'))
    throw new Error('Use an isolated *_classification_test database');
  await db.initialize();
  await db.runMigrations();
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      requests++;
      await onRequest();
      const input = JSON.parse(body);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          answers: Object.fromEntries(
            Object.keys(input.questions).map((key, index) => [
              key,
              { type: 'noul', noul: index === 0 ? 0.95 : 0.05 },
            ]),
          ),
        }),
      );
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.2', resolve));
  const port = server.address().port;
  base = `http://127.0.0.2:${port}/v1`;
  const config = new ConfigService({
    ai: { credentialsEncryptionKey: Buffer.alloc(32, 1).toString('base64') },
    decision: {
      allowHttp: true,
      privateTargets: [`127.0.0.2:${port}`],
      allowedHosts: [],
      timeoutMs: 3000,
      maxQuestions: 24,
      requestsPerMinute: 60,
    },
    database: { host: '127.0.0.1' },
    redis: { host: '127.0.0.1' },
    auth: { baseUrl: 'http://127.0.0.1:5000' },
  });
  const http = new SafeHttpClient(config);
  const client = new JevClient(http, config);
  const limits = {
    request: async () => {},
    cooldown: async () => {},
    clear: async () => {},
  };
  connections = new DecisionConnectionsService(
    db,
    new CredentialEncryptionService(config),
    http,
    client,
    limits,
  );
  const rules = new RulesService(
    db.getRepository(CategorizationRule),
    db.getRepository(RuleCondition),
    db.getRepository(Transaction),
  );
  service = new ClassificationService(db, rules, connections, client, limits);
});
after(async () => {
  if (db.isInitialized) {
    for (const id of users) {
      await db.query(
        'DELETE FROM transactions WHERE "accountId" IN (SELECT id FROM accounts WHERE user_id=$1)',
        [id],
      );
      await db.query('DELETE FROM accounts WHERE user_id=$1', [id]);
      await db.query('DELETE FROM categories WHERE user_id=$1', [id]);
      await db.query('DELETE FROM users WHERE id=$1', [id]);
    }
    await db.destroy();
  }
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
async function fixture(provider = true) {
  onRequest = async () => {};
  const userId = randomUUID();
  users.push(userId);
  await db.query('INSERT INTO users(id,name,email) VALUES($1,$2,$3)', [
    userId,
    'Classification test',
    `${userId}@example.test`,
  ]);
  const [account] = await db.query(
    'INSERT INTO accounts(user_id,name,balance,currency) VALUES($1,$2,0,$3) RETURNING id',
    [userId, 'Test', 'GBP'],
  );
  const categories = await db.query(
    "INSERT INTO categories(user_id,name) VALUES($1,'Groceries'),($1,'Travel') RETURNING id",
    [userId],
  );
  if (provider)
    await connections.save({
      userId,
      create: true,
      dto: {
        displayName: 'Test',
        baseUrl: base,
        authType: 'bearer',
        apiKey: 'test-credential-never-expose',
        isActive: true,
      },
    });
  const [transaction] = await db.query(
    'INSERT INTO transactions("accountId",description,amount,currency,date) VALUES($1,$2,-10,$3,now()) RETURNING id,revision',
    [account.id, 'Shop', 'GBP'],
  );
  const [work] = await db.query(
    'SELECT id,run_id FROM classification_work WHERE user_id=$1 AND transaction_id=$2',
    [userId, transaction.id],
  );
  return { userId, account, categories, transaction, work };
}
async function suggestions(f) {
  return db.query('SELECT * FROM transaction_suggestions WHERE user_id=$1', [
    f.userId,
  ]);
}
void test('transaction rollback removes outbox work and configuration changes', async () => {
  const f = await fixture(false);
  const runner = db.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  const [tx] = await runner.query(
    'INSERT INTO transactions("accountId",description,amount,currency,date) VALUES($1,$2,-2,$3,now()) RETURNING id',
    [f.account.id, 'Rollback', 'GBP'],
  );
  assert.equal(
    (
      await runner.query(
        'SELECT id FROM classification_work WHERE transaction_id=$1',
        [tx.id],
      )
    ).length,
    1,
  );
  await runner.rollbackTransaction();
  await runner.release();
  assert.equal(
    (
      await db.query(
        'SELECT id FROM classification_work WHERE transaction_id=$1',
        [tx.id],
      )
    ).length,
    0,
  );
});
void test('duplicate delivery produces one suggestion and review is atomic', async () => {
  const f = await fixture();
  await Promise.all([
    service.process({ userId: f.userId, id: f.work.id }),
    service.process({ userId: f.userId, id: f.work.id }),
  ]);
  const rows = await suggestions(f);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'pending');
  await db.query('UPDATE transactions SET "categoryId"=$1 WHERE id=$2', [
    rows[0].suggested_category_id,
    f.transaction.id,
  ]);
  assert.equal((await suggestions(f))[0].status, 'accepted');
  assert.equal((await service.stats({ userId: f.userId })).accepted, 1);
  await assert.rejects(
    service.status({ userId: randomUUID(), runId: f.work.run_id }),
  );
});
void test('dismissal suppresses identical inputs without another provider call', async () => {
  const f = await fixture();
  await service.process({ userId: f.userId, id: f.work.id });
  const [s] = await suggestions(f);
  await service.dismiss({ userId: f.userId, id: s.id });
  const before = requests;
  const run = await service.run({
    userId: f.userId,
    dto: { transactionIds: [f.transaction.id] },
  });
  const [w] = await db.query(
    'SELECT id FROM classification_work WHERE user_id=$1 AND run_id=$2',
    [f.userId, run.runId],
  );
  await service.process({ userId: f.userId, id: w.id });
  assert.equal(requests, before);
  assert.equal((await suggestions(f)).length, 1);
});
void test('user edits and configuration edits while HTTP is in flight discard results', async () => {
  for (const change of ['transaction', 'category', 'connection']) {
    const f = await fixture();
    let called = false;
    onRequest = async () => {
      if (called) return;
      called = true;
      if (change === 'transaction')
        await db.query('UPDATE transactions SET description=$1 WHERE id=$2', [
          'Edited',
          f.transaction.id,
        ]);
      if (change === 'category')
        await db.query('UPDATE categories SET name=$1 WHERE id=$2', [
          'Renamed',
          f.categories[0].id,
        ]);
      if (change === 'connection')
        await connections.remove({ userId: f.userId });
    };
    await service.process({ userId: f.userId, id: f.work.id });
    assert.equal((await suggestions(f)).length, 0, change);
  }
});
void test('rules run without a provider and take priority over external calls', async () => {
  const f = await fixture(false);
  const [rule] = await db.query(
    'INSERT INTO categorization_rules(user_id,name,result_category_id,"order") VALUES($1,$2,$3,0) RETURNING id',
    [f.userId, 'Shop', f.categories[0].id],
  );
  await db.query(
    'INSERT INTO rule_conditions("ruleId",field,operator,value,"order") VALUES($1,$2,$3,$4,0)',
    [rule.id, 'description', 'contains', 'Shop'],
  );
  const before = requests;
  await service.process({ userId: f.userId, id: f.work.id });
  const [s] = await suggestions(f);
  assert.equal(s.source, 'rule');
  assert.equal(requests, before);
  await connections.save({
    userId: f.userId,
    create: true,
    dto: {
      displayName: 'Test',
      baseUrl: base,
      authType: 'none',
      isActive: true,
    },
  });
  await connections.remove({ userId: f.userId });
  assert.equal((await suggestions(f))[0].status, 'pending');
  await db.query(
    'UPDATE categorization_rules SET is_active=false WHERE id=$1',
    [rule.id],
  );
  assert.equal((await suggestions(f))[0].status, 'superseded');
  await db.query('DELETE FROM categorization_rules WHERE id=$1', [rule.id]);
});
void test('connection credentials are encrypted and omitted; updates retain omitted secrets', async () => {
  const f = await fixture();
  const c = await connections.get({ userId: f.userId, secrets: true });
  assert.ok(c.encrypted_credentials);
  assert.ok(!c.encrypted_credentials.includes('test-credential'));
  assert.ok(!JSON.stringify(connections.toDto(c)).includes('test-credential'));
  await connections.save({
    userId: f.userId,
    create: false,
    dto: { displayName: 'Renamed' },
  });
  assert.equal(
    connections.credentials(
      await connections.get({ userId: f.userId, secrets: true }),
    ).apiKey,
    'test-credential-never-expose',
  );
});
void test('cross-user category assignment is rejected and deletion cannot recreate work', async () => {
  const f = await fixture();
  const other = await fixture(false);
  await assert.rejects(
    db.query('UPDATE transactions SET "categoryId"=$1 WHERE id=$2', [
      other.categories[0].id,
      f.transaction.id,
    ]),
  );
  await assert.rejects(
    service.run({
      userId: other.userId,
      dto: { transactionIds: [f.transaction.id] },
    }),
  );
  await db.query('DELETE FROM users WHERE id=$1', [f.userId]);
  await service.process({ userId: f.userId, id: f.work.id });
  for (const table of [
    'decision_connections',
    'classification_work',
    'classification_state',
    'transaction_suggestions',
  ])
    assert.equal(
      (await db.query(`SELECT * FROM ${table} WHERE user_id=$1`, [f.userId]))
        .length,
      0,
    );
});

void test(
  'Redis request budgets are connection-scoped and work survives failed dispatch',
  { skip: !process.env.CLASSIFICATION_TEST_REDIS_PORT },
  async () => {
    const { Queue, Worker } = require('bullmq');
    const {
      ClassificationDispatcher,
    } = require('../dist/features/classification/classification.processor');
    const {
      ClassificationLimits,
    } = require('../dist/features/classification/classification-limits.service');
    const f = await fixture();
    const redis = {
      host: '127.0.0.1',
      port: Number(process.env.CLASSIFICATION_TEST_REDIS_PORT),
    };
    const limits = new ClassificationLimits(
      new ConfigService({ redis, decision: { requestsPerMinute: 1 } }),
    );
    const name = `classification-test-${randomUUID()}`;
    const queue = new Queue(name, { connection: redis });
    let worker;
    try {
      await limits.request({ userId: f.userId, connectionId: 'a' });
      await assert.rejects(
        limits.request({ userId: f.userId, connectionId: 'a' }),
        { code: 'rate_limit' },
      );
      await limits.request({ userId: f.userId, connectionId: 'b' });
      await limits.cooldown({
        userId: f.userId,
        connectionId: 'c',
        delay: 2000,
      });
      await assert.rejects(
        limits.request({ userId: f.userId, connectionId: 'c' }),
        { code: 'rate_limit' },
      );
      await new ClassificationDispatcher(db, {
        add: async () => {
          throw new Error('Redis unavailable');
        },
      }).dispatch();
      assert.equal(
        (
          await db.query(
            'SELECT status FROM classification_work WHERE user_id=$1 AND id=$2',
            [f.userId, f.work.id],
          )
        )[0].status,
        'queued',
      );
      const dispatcher = new ClassificationDispatcher(db, queue);
      await dispatcher.dispatch();
      await dispatcher.dispatch();
      const waiting = await queue.getJobs(['waiting']);
      assert.equal(waiting.filter((j) => j.data.userId === f.userId).length, 1);
      await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Queue processing timed out')),
          10000,
        );
        worker = new Worker(name, async (job) => service.process(job.data), {
          connection: redis,
          concurrency: 2,
        });
        worker.on('completed', (job) => {
          if (job.data.id === f.work.id) {
            clearTimeout(timer);
            resolve();
          }
        });
        worker.on('error', (error) => {
          clearTimeout(timer);
          reject(error);
        });
      });
      assert.equal(
        (await service.status({ userId: f.userId, runId: f.work.run_id }))
          .suggested,
        1,
      );
    } finally {
      if (worker) await worker.close();
      await queue.obliterate({ force: true });
      await queue.close();
      await limits.clear({ userId: f.userId });
      limits.onModuleDestroy();
    }
  },
);

void test('evaluation produces a held-out report without exposing transaction text', async () => {
  const { promisify } = require('node:util');
  const { execFile } = require('node:child_process');
  const { mkdtemp, readFile, rm } = require('node:fs/promises');
  const { tmpdir } = require('node:os');
  const { join } = require('node:path');
  const f = await fixture();
  const category = f.categories.map((c) => c.id).sort()[0];
  await db.query('UPDATE transactions SET "categoryId"=$1 WHERE id=$2', [
    category,
    f.transaction.id,
  ]);
  for (let i = 0; i < 3; i++)
    await db.query(
      'INSERT INTO transactions("accountId","categoryId",description,amount,currency,date) VALUES($1,$2,$3,-10,$4,now())',
      [f.account.id, category, `Synthetic private merchant ${i}`, 'GBP'],
    );
  const directory = await mkdtemp(join(tmpdir(), 'classification-eval-'));
  try {
    await promisify(execFile)(
      process.execPath,
      [
        'scripts/classification-eval.cjs',
        '--user',
        f.userId,
        '--allow-send',
        '--limit',
        '4',
        '--output',
        join(directory, 'report'),
      ],
      {
        env: {
          ...process.env,
          ENVIRONMENT: 'development',
          DATABASE_SSL_ENABLED: 'false',
          DATABASE_CREDENTIALS_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString(
            'base64',
          ),
          BETTER_AUTH_SECRET: 'synthetic-test-secret',
          BETTER_AUTH_BASE_URL: 'http://127.0.0.1:5000',
          NORDIGEN_SECRET_ID: 'unused',
          NORDIGEN_SECRET_KEY: 'unused',
          REDIS_HOST: '127.0.0.1',
          DECISION_ALLOW_HTTP: 'true',
          DECISION_PRIVATE_TARGETS: new URL(base).host,
          DECISION_ALLOWED_HOSTS: '',
          DECISION_REQUESTS_PER_MINUTE: '120',
        },
      },
    );
    const report = await readFile(join(directory, 'report.md'), 'utf8');
    assert.match(report, /holdout samples: 2/);
    assert.ok(!report.includes('Synthetic private merchant'));
    assert.match(
      await readFile(join(directory, 'report.csv'), 'utf8'),
      /expected_category_id/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
