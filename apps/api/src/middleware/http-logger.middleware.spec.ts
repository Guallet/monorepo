import { Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { HttpLoggerMiddleware } from './http-logger.middleware';

describe('Authentication request log redaction', () => {
  afterEach(() => vi.restoreAllMocks());
  it.each([
    '/auth/callback/google?code=PRIVATE_CODE',
    '/auth/reset-password/PRIVATE_TOKEN?callbackURL=secret',
    '/AUTH/reset-password/PRIVATE_TOKEN',
    '/%61uth/reset-password/PRIVATE_TOKEN',
    '/native-auth/google/callback?flowId=PRIVATE_FLOW&code=PRIVATE_CODE',
    '/NATIVE-AUTH/reset/callback?code=PRIVATE_CODE',
    '/auth?token=PRIVATE_TOKEN',
    '/native-auth?code=PRIVATE_CODE',
  ])(
    'redacts auth URLs including encoded and case insensitive routes: %s',
    (url) => {
      const log = vi
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => {});
      let finish: () => void = () => {};
      const response = {
        statusCode: 200,
        on: (_: string, callback: () => void) => {
          finish = callback;
        },
      } as Response;
      const next = vi.fn();
      new HttpLoggerMiddleware().use(
        { method: 'GET', originalUrl: url } as Request,
        response,
        next,
      );
      expect(next).toHaveBeenCalledOnce();
      finish();
      expect(log).toHaveBeenCalledOnce();
      expect(log.mock.calls[0][0]).not.toContain('PRIVATE_');
      expect(log.mock.calls[0][0]).toContain('[redacted]');
    },
  );
});
