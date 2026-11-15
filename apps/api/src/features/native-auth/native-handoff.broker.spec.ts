import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { NativeHandoffBroker, digest } from './native-handoff.broker';
import type { FlowRecord } from './native-flow.store';
import { TestFlowStore, testConfig } from '../../../test/fixtures/native-auth';

const verifier = () => randomBytes(32).toString('base64url');
const codeFrom = (url: string) => new URL(url).searchParams.get('code')!;

describe('Native verifier-bound credential broker', () => {
  let store: TestFlowStore;
  let broker: NativeHandoffBroker;
  beforeEach(() => {
    store = new TestFlowStore();
    broker = new NativeHandoffBroker(store, testConfig());
  });
  async function google() {
    const secret = verifier();
    const { flowId } = await broker.create('google', digest(secret));
    const binding = await broker.startGoogle(flowId);
    const location = await broker.publishGoogle(
      flowId,
      binding,
      'better-auth.session_token=SECRET; Path=/; HttpOnly; Secure',
    );
    return { secret, flowId, location, code: codeFrom(location) };
  }
  it('generates a separate completion code and stores credentials only as authenticated ciphertext', async () => {
    const flow = await google();
    expect(flow.code).not.toBe(flow.flowId);
    const native = await broker.redirect('google', flow.flowId, flow.code);
    expect([...new URL(native).searchParams.keys()].sort()).toEqual([
      'code',
      'flow',
    ]);
    expect(native).not.toMatch(/SECRET|cookie=|token=/);
    const stored = store.records.get(flow.flowId)!;
    for (const privateValue of ['SECRET', flow.secret, flow.code])
      expect(stored).not.toContain(privateValue);
    expect(
      await broker.redeem('google', flow.flowId, flow.code, flow.secret),
    ).toMatchObject({ cookie: expect.stringContaining('SECRET') });
    await expect(
      broker.redeem('google', flow.flowId, flow.code, flow.secret),
    ).rejects.toThrow(BadRequestException);
  });
  it('a wrong verifier, guessed code, or wrong operation cannot consume the valid handoff', async () => {
    const flow = await google();
    await expect(
      broker.redeem('google', flow.flowId, flow.code, verifier()),
    ).rejects.toThrow(BadRequestException);
    await expect(
      broker.redeem('google', flow.flowId, flow.flowId, flow.secret),
    ).rejects.toThrow(BadRequestException);
    await expect(
      broker.redeem('reset', flow.flowId, flow.code, flow.secret),
    ).rejects.toThrow(BadRequestException);
    expect(
      await broker.redeem('google', flow.flowId, flow.code, flow.secret),
    ).toHaveProperty('cookie');
  });
  it('only one concurrent redemption can succeed', async () => {
    const flow = await google();
    const results = await Promise.allSettled(
      Array.from({ length: 12 }, () =>
        broker.redeem('google', flow.flowId, flow.code, flow.secret),
      ),
    );
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
  });
  it('cannot restart, overwrite, or publish an unbound Google flow', async () => {
    const secret = verifier();
    const { flowId } = await broker.create('google', digest(secret));
    await expect(
      broker.publishGoogle(flowId, undefined, 'SECRET'),
    ).rejects.toThrow();
    const binding = await broker.startGoogle(flowId);
    await expect(broker.startGoogle(flowId)).rejects.toThrow();
    await expect(
      broker.publishGoogle(flowId, `${flowId}.${verifier()}`, 'SECRET'),
    ).rejects.toThrow();
    const location = await broker.publishGoogle(flowId, binding, 'SECRET');
    await expect(
      broker.publishGoogle(flowId, binding, 'REPLACEMENT'),
    ).rejects.toThrow();
    expect(
      (await broker.redeem('google', flowId, codeFrom(location), secret))
        .cookie,
    ).toBe('SECRET');
  });
  it('rejects expired references and tampering with the encrypted payload or bound challenge', async () => {
    const flow = await google();
    const original = store.records.get(flow.flowId)!;
    const record = JSON.parse(original) as FlowRecord;
    record.challenge = digest(verifier());
    store.records.set(flow.flowId, JSON.stringify(record));
    await expect(
      broker.redeem('google', flow.flowId, flow.code, flow.secret),
    ).rejects.toThrow();
    store.records.set(flow.flowId, original);
    record.challenge = digest(flow.secret);
    record.payload = record.payload!.slice(0, -12) + 'AAAAAAAAAAAA';
    store.records.set(flow.flowId, JSON.stringify(record));
    await expect(
      broker.redeem('google', flow.flowId, flow.code, flow.secret),
    ).rejects.toThrow();
    store.records.delete(flow.flowId);
    await expect(
      broker.redeem('google', flow.flowId, flow.code, flow.secret),
    ).rejects.toThrow();
  });
  it('binds reset tokens to the requested email and keeps repeated email opens usable until redemption', async () => {
    const secret = verifier();
    const { flowId } = await broker.create(
      'reset',
      digest(secret),
      'Alex@Example.test',
    );
    await expect(
      broker.publishReset(flowId, 'RESET_SECRET', 'other@example.test'),
    ).rejects.toThrow();
    const location = await broker.publishReset(
      flowId,
      'RESET_SECRET',
      'alex@example.test',
    );
    expect(
      await broker.publishReset(flowId, 'RESET_SECRET', 'alex@example.test'),
    ).toBe(location);
    expect(store.records.get(flowId)).not.toContain('RESET_SECRET');
    expect(store.records.get(flowId)).not.toContain('alex@example.test');
    const native = await broker.redirect('reset', flowId, codeFrom(location));
    expect(native).not.toContain('token');
    expect(
      await broker.redeem('reset', flowId, codeFrom(location), secret),
    ).toHaveProperty('resetToken', 'RESET_SECRET');
  });
  it('provider failures return no credentials and cannot fall back to a previous browser session', async () => {
    const secret = verifier();
    const { flowId } = await broker.create('google', digest(secret));
    const binding = await broker.startGoogle(flowId);
    const location = await broker.publishGoogle(flowId, binding);
    await expect(
      broker.redeem('google', flowId, codeFrom(location), secret),
    ).rejects.toThrow();
    expect(store.records.has(flowId)).toBe(false);
  });
});
