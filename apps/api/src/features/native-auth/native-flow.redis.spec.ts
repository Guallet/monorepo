import { randomUUID, createHash, randomBytes } from 'node:crypto';
import { Queue } from 'bullmq';
import { NativeFlowStore } from './native-flow.store';
import { NativeHandoffBroker, digest } from './native-handoff.broker';
import { testConfig } from '../../../test/fixtures/native-auth';

const redisUrl = process.env.GUALLET_TEST_REDIS_URL;
describe.skipIf(!redisUrl)('Native handoff atomic Redis integration', () => {
  const queues: Queue[] = [];
  const ids = new Set<string>();
  let store: NativeFlowStore;
  let broker: NativeHandoffBroker;
  let replica: NativeHandoffBroker;
  function key(id: string) {
    return `native-auth:v1:${createHash('sha256').update(id).digest('hex')}`;
  }
  async function ttl(id: string) {
    const client = await queues[0].getBackend().client;
    return (await client.runCommand('nativeTestTTL', [key(id)])) as number;
  }
  beforeAll(async () => {
    const url = new URL(redisUrl!);
    for (let index = 0; index < 2; index++) {
      const queue = new Queue(`native-handoff-test-${randomUUID()}`, {
        connection: {
          host: url.hostname,
          port: Number(url.port || 6379),
          username: url.username || undefined,
          password: url.password || undefined,
          db: Number(url.pathname.slice(1) || 0),
        },
      });
      await queue.waitUntilReady();
      queues.push(queue);
    }
    const client = await queues[0].getBackend().client;
    client.defineCommand('nativeTestTTL', {
      numberOfKeys: 1,
      lua: "return redis.call('PTTL', KEYS[1])",
    });
    client.defineCommand('nativeTestExpire', {
      numberOfKeys: 1,
      lua: "return redis.call('PEXPIRE', KEYS[1], ARGV[1])",
    });
    store = new NativeFlowStore(queues[0]);
    broker = new NativeHandoffBroker(store, testConfig());
    replica = new NativeHandoffBroker(
      new NativeFlowStore(queues[1]),
      testConfig(),
    );
  });
  afterAll(async () => {
    if (store)
      for (const id of ids) {
        const current = await store.find(id);
        if (current) await store.consume(id, current.raw);
      }
    for (const queue of queues) {
      await queue.obliterate({ force: true });
      await queue.close();
    }
  });
  async function google() {
    const verifier = randomBytes(32).toString('base64url');
    const { flowId } = await broker.create('google', digest(verifier));
    ids.add(flowId);
    expect(await ttl(flowId)).toBeGreaterThan(0);
    expect(await ttl(flowId)).toBeLessThanOrEqual(600_000);
    const binding = await broker.startGoogle(flowId);
    const location = await broker.publishGoogle(
      flowId,
      binding,
      'SESSION_SECRET',
    );
    return {
      flowId,
      code: new URL(location).searchParams.get('code')!,
      verifier,
    };
  }
  it('consumes a handoff once across independent API replica connections', async () => {
    const flow = await google();
    const results = await Promise.allSettled(
      Array.from({ length: 16 }, (_, index) =>
        (index % 2 ? broker : replica).redeem(
          'google',
          flow.flowId,
          flow.code,
          flow.verifier,
        ),
      ),
    );
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(await store.find(flow.flowId)).toBeNull();
  });
  it('keeps valid codes usable after invalid attempts without extending expiry', async () => {
    const flow = await google();
    const before = await ttl(flow.flowId);
    expect(before).toBeLessThanOrEqual(300_000);
    await expect(
      replica.redeem('google', flow.flowId, flow.code, 'X'.repeat(43)),
    ).rejects.toThrow();
    await expect(
      replica.redeem('google', flow.flowId, flow.flowId, flow.verifier),
    ).rejects.toThrow();
    expect(await ttl(flow.flowId)).toBeLessThanOrEqual(before);
    expect(
      (await broker.redeem('google', flow.flowId, flow.code, flow.verifier))
        .cookie,
    ).toBe('SESSION_SECRET');
  });
  it('fails closed when Redis expires the ready credential payload', async () => {
    const flow = await google();
    const client = await queues[0].getBackend().client;
    await client.runCommand('nativeTestExpire', [key(flow.flowId), 1]);
    await new Promise((resolve) => setTimeout(resolve, 20));
    await expect(
      broker.redeem('google', flow.flowId, flow.code, flow.verifier),
    ).rejects.toThrow();
    expect(await store.find(flow.flowId)).toBeNull();
  });
  it('does not extend a reset handoff when the email is opened again', async () => {
    const verifier = randomBytes(32).toString('base64url');
    const { flowId } = await broker.create(
      'reset',
      digest(verifier),
      'alex@example.test',
    );
    ids.add(flowId);
    const first = await broker.publishReset(
      flowId,
      'RESET_SECRET',
      'alex@example.test',
    );
    const before = await ttl(flowId);
    expect(
      await replica.publishReset(flowId, 'RESET_SECRET', 'alex@example.test'),
    ).toBe(first);
    expect(await ttl(flowId)).toBeLessThanOrEqual(before);
    expect((await store.find(flowId))?.raw).not.toContain('RESET_SECRET');
  });
});
