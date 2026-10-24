import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { request as httpsRequest } from 'node:https';
import { request as httpRequest } from 'node:http';
import { AppConfig } from 'src/configuration';

export class DecisionError extends Error {
  constructor(
    public readonly code:
      | 'blocked'
      | 'auth'
      | 'rate_limit'
      | 'unavailable'
      | 'protocol',
    public readonly retryAfterMs = 60_000,
  ) {
    super(`Decision service: ${code}`);
  }
}
const reserved = new BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8], //NOSONAR -- RFC1918 denylist entry for SSRF protection.
  ['100.64.0.0', 10], //NOSONAR -- shared-address denylist entry for SSRF protection.
  ['127.0.0.0', 8],
  ['169.254.0.0', 16], //NOSONAR -- link-local denylist entry for SSRF protection.
  ['172.16.0.0', 12], //NOSONAR -- RFC1918 denylist entry for SSRF protection.
  ['192.0.0.0', 24], //NOSONAR -- special-purpose denylist entry for SSRF protection.
  ['192.0.2.0', 24],
  ['192.168.0.0', 16], //NOSONAR -- RFC1918 denylist entry for SSRF protection.
  ['198.18.0.0', 15], //NOSONAR -- benchmarking denylist entry for SSRF protection.
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4], //NOSONAR -- multicast denylist entry for SSRF protection.
  ['240.0.0.0', 4], //NOSONAR -- reserved-range denylist entry for SSRF protection.
] as const)
  reserved.addSubnet(address, prefix);
const publicV6 = new BlockList();
publicV6.addSubnet('2000::', 3, 'ipv6'); //NOSONAR -- global-unicast range for SSRF allow policy.
const reservedV6 = new BlockList();
for (const [address, prefix] of [
  ['2001::', 23], //NOSONAR -- special-purpose denylist entry for SSRF protection.
  ['2001:db8::', 32],
  ['2002::', 16], //NOSONAR -- deprecated tunnel denylist entry for SSRF protection.
  ['3fff::', 20], //NOSONAR -- documentation range denylist entry for SSRF protection.
] as const)
  reservedV6.addSubnet(address, prefix, 'ipv6');
export function canonicalIp(address: string): string {
  const ip = address.replace(/^\[|\]$/g, '').toLowerCase();
  if (!isIP(ip)) return ip;
  if (isIP(ip) === 4) return ip;
  const normalized = new URL(`http://[${ip}]`).hostname.slice(1, -1);
  const match = /^::ffff:([\da-f]+):([\da-f]+)$/.exec(normalized);
  if (!match) return normalized;
  const value =
    Number.parseInt(match[1], 16) * 65536 + Number.parseInt(match[2], 16);
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.');
}
export function isPublicAddress(address: string): boolean {
  const ip = canonicalIp(address);
  return isIP(ip) === 4
    ? !reserved.check(ip)
    : isIP(ip) === 6 &&
        publicV6.check(ip, 'ipv6') &&
        !reservedV6.check(ip, 'ipv6');
}
export function isMetadataAddress(address: string): boolean {
  const ip = canonicalIp(address);
  return (
    ip.startsWith('169.254.') ||
    ip === 'fd00:ec2::254' || //NOSONAR -- cloud metadata endpoint blocked for SSRF protection.
    ip === '100.100.100.200' || //NOSONAR -- cloud metadata endpoint blocked for SSRF protection.
    ip === '168.63.129.16' //NOSONAR -- cloud metadata endpoint blocked for SSRF protection.
  );
}

function responseError(status: number, retryHeader: string | undefined) {
  let code: DecisionError['code'];
  if (status === 401 || status === 403) code = 'auth';
  else if (status === 429) code = 'rate_limit';
  else if (status >= 500) code = 'unavailable';
  else code = 'protocol';

  const retrySeconds = Number(retryHeader);
  const retryDate = Date.parse(String(retryHeader)) - Date.now();
  const delay = Number.isFinite(retrySeconds) ? retrySeconds * 1000 : retryDate;
  return new DecisionError(
    code,
    Math.min(900000, Math.max(1000, Number.isFinite(delay) ? delay : 60000)),
  );
}

@Injectable()
export class SafeHttpClient {
  constructor(private readonly config: ConfigService<AppConfig>) {}

  async validate(
    value: string,
  ): Promise<{ url: URL; address: string; family: number }> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        this.resolveTarget(value),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new DecisionError('unavailable')),
            this.config.getOrThrow('decision', { infer: true }).timeoutMs,
          );
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  private async resolveTarget(
    value: string,
  ): Promise<{ url: URL; address: string; family: number }> {
    const policy = this.config.getOrThrow('decision', { infer: true });
    const url = this.parseTarget(value, policy.allowHttp);
    const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
    if (policy.allowedHosts.length && !policy.allowedHosts.includes(hostname))
      throw new DecisionError('blocked');
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    const privateAllowed = policy.privateTargets.includes(
      `${url.hostname.toLowerCase()}:${port}`,
    );
    const protectedHosts = this.protectedHosts();
    if (protectedHosts.includes(hostname)) throw new DecisionError('blocked');
    const addresses = await this.resolveAddresses(hostname);
    const protectedIps = await this.resolveProtectedIps(
      protectedHosts,
      privateAllowed,
    );
    if (
      !addresses.length ||
      addresses.some(
        (a) =>
          isMetadataAddress(a.address) ||
          protectedIps.has(canonicalIp(a.address)) ||
          (!privateAllowed && !isPublicAddress(a.address)),
      )
    )
      throw new DecisionError('blocked');
    return { url, ...addresses[0] };
  }

  private parseTarget(value: string, allowHttp: boolean): URL {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new DecisionError('blocked');
    }
    const protocols = allowHttp ? ['https:', 'http:'] : ['https:'];
    if (
      value.length > 2048 ||
      url.username ||
      url.password ||
      url.hash ||
      url.search ||
      !url.hostname ||
      !protocols.includes(url.protocol)
    )
      throw new DecisionError('blocked');
    return url;
  }

  private protectedHosts(): string[] {
    const db = this.config.getOrThrow('database', { infer: true });
    const redis = this.config.getOrThrow('redis', { infer: true });
    const auth = this.config.getOrThrow('auth', { infer: true });
    return [db.host, redis.host, new URL(auth.baseUrl).hostname]
      .filter((host) => !host.startsWith('/'))
      .map((host) => host.replace(/^\[|\]$/g, '').toLowerCase());
  }

  private async resolveAddresses(hostname: string) {
    try {
      if (isIP(hostname))
        return [{ address: hostname, family: isIP(hostname) }];
      return await lookup(hostname, { all: true });
    } catch {
      throw new DecisionError('unavailable');
    }
  }

  private async resolveProtectedIps(
    protectedHosts: string[],
    privateAllowed: boolean,
  ) {
    // Resolve configured services as well, so DNS aliases cannot bypass blocking.
    const results = await Promise.all(
      protectedHosts.map(async (host) => {
        if (isIP(host)) return [canonicalIp(host)];
        try {
          const addresses = await lookup(host, { all: true });
          return addresses.map((address) => canonicalIp(address.address));
        } catch {
          if (privateAllowed) throw new DecisionError('blocked');
          return [];
        }
      }),
    );
    return new Set(results.flat());
  }

  async post(
    baseUrl: string,
    body: unknown,
    headers: Record<string, string>,
  ): Promise<unknown> {
    const timeout = this.config.getOrThrow('decision', {
      infer: true,
    }).timeoutMs;
    // Deadline includes DNS and body consumption, not just socket inactivity.
    return new Promise((resolve, reject) => {
      let expired = false;
      let abort: (() => void) | undefined;
      const timer = setTimeout(() => {
        expired = true;
        abort?.();
        reject(new DecisionError('unavailable'));
      }, timeout);
      const finish = (error?: DecisionError, value?: unknown) => {
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(value);
      };
      void this.validate(baseUrl)
        .then(({ url, address, family }) => {
          if (expired) return;
          const payload = JSON.stringify(body);
          if (Buffer.byteLength(payload) > 65536) {
            finish(new DecisionError('protocol'));
            return;
          }
          url.pathname = `${url.pathname.replace(/\/$/, '')}/systemone`;
          const req = (url.protocol === 'https:' ? httpsRequest : httpRequest)(
            url,
            {
              method: 'POST',
              agent: false,
              headers: {
                ...headers,
                'content-type': 'application/json',
                accept: 'application/json',
                'content-length': Buffer.byteLength(payload).toString(),
              },
              lookup: (_host, options, callback) => {
                if (options.all) callback(null, [{ address, family }]);
                else callback(null, address, family);
              },
            },
            (res) => {
              const status = res.statusCode ?? 0;
              if (status !== 200) {
                finish(responseError(status, res.headers['retry-after']));
                res.destroy();
                return;
              }
              if (
                !/^application\/json(?:\s*;|$)/i.test(
                  res.headers['content-type'] ?? '',
                )
              ) {
                finish(new DecisionError('protocol'));
                res.destroy();
                return;
              }
              let size = 0;
              const chunks: Buffer[] = [];
              res.on('data', (chunk: Buffer) => {
                size += chunk.length;
                if (size > 65536) {
                  finish(new DecisionError('protocol'));
                  res.destroy();
                } else chunks.push(chunk);
              });
              res.on('error', () => finish(new DecisionError('unavailable')));
              res.on('end', () => {
                try {
                  finish(
                    undefined,
                    JSON.parse(
                      Buffer.concat(chunks).toString('utf8'),
                    ) as unknown,
                  );
                } catch {
                  finish(new DecisionError('protocol'));
                }
              });
            },
          );
          abort = () => req.destroy();
          req.on('error', () => finish(new DecisionError('unavailable')));
          req.end(payload);
        })
        .catch((error: unknown) =>
          finish(
            error instanceof DecisionError
              ? error
              : new DecisionError('unavailable'),
          ),
        );
    });
  }
}
