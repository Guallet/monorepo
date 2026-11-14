import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHash } from 'node:crypto';

export const NATIVE_AUTH_QUEUE = 'native-auth-handoffs';
export const FLOW_TTL = 600;
export type FlowKind = 'google' | 'reset';
export type FlowStatus = 'created' | 'started' | 'ready';
export interface FlowRecord {
  kind: FlowKind;
  status: FlowStatus;
  challenge: string;
  payload?: string;
  codeHash?: string;
  browserHash?: string;
  emailHash?: string;
}
export const CREATE_FLOW = `if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2]); return 1`;
export const TRANSITION_FLOW = `local raw = redis.call('GET', KEYS[1]); if not raw then return 0 end
local value = cjson.decode(raw)
if value.kind ~= ARGV[1] or value.status ~= ARGV[2] then return 0 end
local ttl = redis.call('PTTL', KEYS[1]); if ttl <= 0 then return 0 end
value.status = ARGV[3]
local fields = cjson.decode(ARGV[4]); for k, v in pairs(fields) do value[k] = v end
if ARGV[3] == 'ready' then ttl = math.min(ttl, 300000) end
redis.call('SET', KEYS[1], cjson.encode(value), 'PX', ttl); return 1`;
export const CONSUME_FLOW = `local raw = redis.call('GET', KEYS[1]); if raw ~= ARGV[1] then return 0 end
redis.call('DEL', KEYS[1]); return 1`;

/** Redis TTL + compare-and-delete work across API replicas, without persistent database entities. */
@Injectable()
export class NativeFlowStore {
  private readonly registered = new WeakSet<object>();
  constructor(@InjectQueue(NATIVE_AUTH_QUEUE) private readonly queue: Queue) {}
  private key(id: string) {
    return `native-auth:v1:${createHash('sha256').update(id).digest('hex')}`;
  }
  private async client() {
    const client = await this.queue.getBackend().client;
    if (!this.registered.has(client)) {
      client.defineCommand('gualletNativeCreate', {
        numberOfKeys: 1,
        lua: CREATE_FLOW,
      });
      client.defineCommand('gualletNativeTransition', {
        numberOfKeys: 1,
        lua: TRANSITION_FLOW,
      });
      client.defineCommand('gualletNativeConsume', {
        numberOfKeys: 1,
        lua: CONSUME_FLOW,
      });
      this.registered.add(client);
    }
    return client;
  }
  async create(id: string, record: FlowRecord) {
    const result: unknown = await (
      await this.client()
    ).runCommand('gualletNativeCreate', [
      this.key(id),
      JSON.stringify(record),
      FLOW_TTL,
    ]);
    return result === 1;
  }
  async find(id: string): Promise<{ raw: string; record: FlowRecord } | null> {
    const raw = await (await this.client()).get(this.key(id));
    return raw ? { raw, record: JSON.parse(raw) as FlowRecord } : null;
  }
  async transition(
    id: string,
    kind: FlowKind,
    from: FlowStatus,
    to: FlowStatus,
    fields: Partial<
      Pick<FlowRecord, 'payload' | 'codeHash' | 'browserHash'>
    > = {},
  ) {
    const result: unknown = await (
      await this.client()
    ).runCommand('gualletNativeTransition', [
      this.key(id),
      kind,
      from,
      to,
      JSON.stringify(fields),
    ]);
    return result === 1;
  }
  async consume(id: string, raw: string) {
    const result: unknown = await (
      await this.client()
    ).runCommand('gualletNativeConsume', [this.key(id), raw]);
    return result === 1;
  }
}
