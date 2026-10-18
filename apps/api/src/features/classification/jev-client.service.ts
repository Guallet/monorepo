import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { AppConfig } from 'src/configuration';
import { CategoryOption } from './classification.logic';
import { DecisionConnection } from './entities/decision-connection.entity';
import { SafeHttpClient, DecisionError } from './http/safe-http-client';

export type Credentials = {
  apiKey?: string;
  headerValue?: string;
  clientId?: string;
  clientSecret?: string;
};
export function authHeaders(
  connection: Pick<DecisionConnection, 'auth_type' | 'auth_header_name'>,
  credentials: Credentials,
): Record<string, string> {
  if (connection.auth_type === 'none') return {};
  if (connection.auth_type === 'bearer' && credentials.apiKey)
    return { authorization: `Bearer ${credentials.apiKey}` };
  if (
    connection.auth_type === 'basic' &&
    credentials.clientId &&
    credentials.clientSecret
  )
    return {
      authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
    };
  if (connection.auth_type === 'header' && credentials.headerValue) {
    const name = connection.auth_header_name?.toLowerCase() ?? '';
    // Only explicitly named API-key headers are supported; transport, proxy,
    // routing and forwarding headers must never be controlled by the user.
    if (!/^x-[a-z0-9-]*(?:key|token)$/.test(name) || name.length > 64)
      throw new DecisionError('protocol');
    return { [name]: credentials.headerValue };
  }
  throw new DecisionError('auth');
}
const responseSchema = z.object({
  answers: z.record(
    z.string(),
    z.object({ type: z.literal('noul'), noul: z.number().min(0).max(1) }),
  ),
});
@Injectable()
export class JevClient {
  constructor(
    private readonly http: SafeHttpClient,
    private readonly config: ConfigService<AppConfig>,
  ) {}
  async scores(
    connection: DecisionConnection,
    credentials: Credentials,
    state: unknown,
    options: CategoryOption[],
    beforeRequest: () => Promise<void>,
  ): Promise<Record<string, number>> {
    const scores: Record<string, number> = {};
    const max = this.config.getOrThrow('decision', {
      infer: true,
    }).maxQuestions;
    if (options.length > 500) throw new DecisionError('protocol');
    for (let offset = 0; offset < options.length; offset += max) {
      await beforeRequest();
      const batch = options.slice(offset, offset + max);
      const raw = await this.http.post(
        connection.base_url,
        {
          model: connection.model,
          state,
          questions: Object.fromEntries(
            batch.map((o) => [
              o.key,
              {
                type: 'noul',
                instructions: `Does this transaction belong to the category ${JSON.stringify(o.label)}? Answer yes only if this is a clear fit.`,
              },
            ]),
          ),
        },
        authHeaders(connection, credentials),
      );
      const parsed = responseSchema.safeParse(raw);
      if (
        !parsed.success ||
        Object.keys(parsed.data.answers).length !== batch.length ||
        batch.some(
          (o) =>
            !Object.prototype.hasOwnProperty.call(parsed.data.answers, o.key),
        )
      )
        throw new DecisionError('protocol');
      for (const option of batch)
        scores[option.key] = parsed.data.answers[option.key].noul;
    }
    return scores;
  }
}
