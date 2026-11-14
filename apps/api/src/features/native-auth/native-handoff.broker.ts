import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import type { AppConfig } from '../../configuration';
import { FLOW_TTL, FlowKind, NativeFlowStore } from './native-flow.store';

export const BROWSER_BINDING_COOKIE = '__Host-guallet.native_binding';
interface HandoffPayload {
  cookie?: string;
  resetToken?: string;
  failed?: boolean;
  code?: string;
}
export function digest(value: string) {
  return createHash('sha256').update(value).digest('base64url');
}
function equals(left: string, right: string) {
  const first = Buffer.from(left);
  const second = Buffer.from(right);
  return first.length === second.length && timingSafeEqual(first, second);
}

/** Only the Better Auth callback hook can publish credentials. Public callbacks merely redirect. */
@Injectable()
export class NativeHandoffBroker {
  readonly baseUrl: string;
  private readonly key: Buffer;
  constructor(
    @Inject(NativeFlowStore) private readonly store: Pick<
      NativeFlowStore,
      'create' | 'find' | 'transition' | 'consume'
    >,
    config: ConfigService<AppConfig>,
  ) {
    const auth = config.getOrThrow('auth', { infer: true });
    this.baseUrl = new URL(auth.baseUrl).origin;
    this.key = createHash('sha256')
      .update(`guallet-native-handoff-v1\0${auth.secret}`)
      .digest();
  }
  private invalid(): never {
    throw new BadRequestException(
      'This native authentication flow is invalid or has expired.',
    );
  }
  private validId(id: string) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(id)) this.invalid();
  }
  callback(id: string, kind: FlowKind) {
    return `${this.baseUrl}/native-auth/${kind}/callback?flowId=${id}`;
  }
  private seal(
    id: string,
    kind: FlowKind,
    challenge: string,
    codeHash: string,
    payload: HandoffPayload,
  ) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from(`${id}:${kind}:${challenge}:${codeHash}`));
    const data = Buffer.concat([
      cipher.update(JSON.stringify(payload)),
      cipher.final(),
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url');
  }
  private open(
    id: string,
    kind: FlowKind,
    challenge: string,
    codeHash: string,
    sealed: string,
  ): HandoffPayload {
    try {
      const bytes = Buffer.from(sealed, 'base64url');
      const cipher = createDecipheriv(
        'aes-256-gcm',
        this.key,
        bytes.subarray(0, 12),
      );
      cipher.setAuthTag(bytes.subarray(12, 28));
      cipher.setAAD(Buffer.from(`${id}:${kind}:${challenge}:${codeHash}`));
      return JSON.parse(
        Buffer.concat([
          cipher.update(bytes.subarray(28)),
          cipher.final(),
        ]).toString(),
      ) as HandoffPayload;
    } catch {
      return this.invalid();
    }
  }
  async create(kind: FlowKind, challenge: string, email?: string) {
    if (!this.baseUrl.startsWith('https://'))
      throw new BadRequestException(
        'Native browser authentication requires an HTTPS public API URL.',
      );
    if (!/^[A-Za-z0-9_-]{43}$/.test(challenge)) this.invalid();
    const flowId = randomBytes(32).toString('base64url');
    if (
      !(await this.store.create(flowId, {
        kind,
        challenge,
        status: kind === 'google' ? 'created' : 'started',
        ...(email ? { emailHash: digest(email.trim().toLowerCase()) } : {}),
      }))
    )
      this.invalid();
    return { flowId, expiresIn: FLOW_TTL };
  }
  async startGoogle(id: string) {
    this.validId(id);
    const secret = randomBytes(32).toString('base64url');
    if (
      !(await this.store.transition(id, 'google', 'created', 'started', {
        browserHash: digest(secret),
      }))
    )
      this.invalid();
    return `${id}.${secret}`;
  }
  async publishGoogle(
    id: string,
    binding: string | undefined,
    cookie?: string,
  ) {
    this.validId(id);
    const current = await this.store.find(id);
    const [boundId, secret] = (binding ?? '').split('.');
    if (
      !current ||
      !secret ||
      boundId !== id ||
      !current.record.browserHash ||
      !equals(current.record.browserHash, digest(secret))
    )
      this.invalid();
    return this.ready(id, 'google', cookie ? { cookie } : { failed: true });
  }
  async publishReset(
    id: string,
    token: string | undefined,
    email: string | undefined,
  ) {
    this.validId(id);
    const current = await this.store.find(id);
    if (
      token &&
      (!email ||
        !current?.record.emailHash ||
        !equals(current.record.emailHash, digest(email.trim().toLowerCase())))
    )
      this.invalid();
    if (
      current?.record.kind === 'reset' &&
      current.record.status === 'ready' &&
      current.record.codeHash &&
      current.record.payload &&
      token
    ) {
      const existing = this.open(
        id,
        'reset',
        current.record.challenge,
        current.record.codeHash,
        current.record.payload,
      );
      if (
        existing.resetToken &&
        existing.code &&
        equals(existing.resetToken, token)
      )
        return `${this.callback(id, 'reset')}&code=${existing.code}`;
      this.invalid();
    }
    return this.ready(
      id,
      'reset',
      token ? { resetToken: token } : { failed: true },
    );
  }
  private async ready(id: string, kind: FlowKind, payload: HandoffPayload) {
    const current = await this.store.find(id);
    if (
      !current ||
      current.record.kind !== kind ||
      current.record.status !== 'started'
    )
      this.invalid();
    const code = randomBytes(32).toString('base64url');
    const codeHash = digest(code);
    const cipher = this.seal(id, kind, current.record.challenge, codeHash, {
      ...payload,
      code,
    });
    if (
      !(await this.store.transition(id, kind, 'started', 'ready', {
        payload: cipher,
        codeHash,
      }))
    )
      this.invalid();
    return `${this.callback(id, kind)}&code=${code}`;
  }
  async redirect(kind: FlowKind, id: string, code: string) {
    this.validId(id);
    if (!/^[A-Za-z0-9_-]{43}$/.test(code)) this.invalid();
    const current = await this.store.find(id);
    if (
      !current ||
      current.record.kind !== kind ||
      current.record.status !== 'ready' ||
      !current.record.codeHash ||
      !equals(current.record.codeHash, digest(code))
    )
      this.invalid();
    return `guallet-android://login/${kind === 'google' ? 'callback' : 'reset-password'}?flow=${id}&code=${code}`;
  }
  async redeem(kind: FlowKind, id: string, code: string, verifier: string) {
    this.validId(id);
    if (
      !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) ||
      !/^[A-Za-z0-9_-]{43}$/.test(code)
    )
      this.invalid();
    const current = await this.store.find(id);
    if (
      !current ||
      current.record.status !== 'ready' ||
      current.record.kind !== kind ||
      !current.record.payload ||
      !current.record.codeHash
    )
      this.invalid();
    if (
      !equals(current.record.challenge, digest(verifier)) ||
      !equals(current.record.codeHash, digest(code))
    )
      this.invalid();
    const payload = this.open(
      id,
      kind,
      current.record.challenge,
      current.record.codeHash,
      current.record.payload,
    );
    if (!(await this.store.consume(id, current.raw))) this.invalid();
    if (payload.failed) this.invalid();
    return payload;
  }
}
