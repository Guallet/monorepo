import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../src/configuration';
import type {
  FlowKind,
  FlowRecord,
  FlowStatus,
} from '../../src/features/native-auth/native-flow.store';

export class TestFlowStore {
  readonly records = new Map<string, string>();
  async create(id: string, record: FlowRecord) {
    if (this.records.has(id)) return false;
    this.records.set(id, JSON.stringify(record));
    return true;
  }
  async find(id: string) {
    const raw = this.records.get(id);
    return raw ? { raw, record: JSON.parse(raw) as FlowRecord } : null;
  }
  async transition(
    id: string,
    kind: FlowKind,
    from: FlowStatus,
    to: FlowStatus,
    fields = {},
  ) {
    const raw = this.records.get(id);
    const current = raw ? { raw, record: JSON.parse(raw) as FlowRecord } : null;
    if (
      !current ||
      current.record.kind !== kind ||
      current.record.status !== from
    )
      return false;
    // No suspension between compare and write, matching the Redis Lua transaction.
    this.records.set(
      id,
      JSON.stringify({ ...current.record, ...fields, status: to }),
    );
    return true;
  }
  async consume(id: string, raw: string) {
    if (this.records.get(id) !== raw) return false;
    this.records.delete(id);
    return true;
  }
}
export const testConfig = () =>
  new ConfigService<AppConfig>({
    auth: {
      baseUrl: 'https://api.example.test',
      secret: 'native-handoff-test-secret-with-at-least-32-characters',
      allowedOrigins: [],
    },
  });
