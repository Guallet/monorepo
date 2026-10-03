import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  ALLOWED_DATE_FORMATS,
  UserCurrenciesSettingsRequestDto,
  UserSettingsRequest,
} from './user-settings.dto';

function validateSettings(payload: unknown): Promise<UserSettingsRequest> {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  return pipe.transform(payload, {
    type: 'body',
    metatype: UserSettingsRequest,
  });
}

describe('User settings request validation', () => {
  it.each([
    { currencies: { preferred_currencies: ['GBP', 'EUR'] } },
    { currencies: { preferred_currencies: [] } },
    { currencies: { default_currency: 'GBP' } },
    {
      currencies: {
        default_currency: 'GBP',
        preferred_currencies: ['GBP', 'EUR'],
      },
      date_format: 'DD/MM/YYYY',
    },
  ])('accepts a partial currency settings update: %j', async (payload) => {
    const result = await validateSettings(payload);

    expect(result).toBeInstanceOf(UserSettingsRequest);
    expect(result.currencies).toBeInstanceOf(UserCurrenciesSettingsRequestDto);
    expect(result).toMatchObject(payload);
  });

  it.each(ALLOWED_DATE_FORMATS)(
    'accepts date format %s',
    async (date_format) => {
      const result = await validateSettings({ date_format });

      expect(result.date_format).toBe(date_format);
      expect(result.currencies).toBeUndefined();
    },
  );

  it('accepts an update with no fields', async () => {
    await expect(validateSettings({})).resolves.toBeInstanceOf(
      UserSettingsRequest,
    );
  });

  it.each([
    { currencies: { preferred_currencies: 'GBP' } },
    { currencies: { preferred_currencies: [123] } },
    { currencies: { preferred_currencies: ['GB'] } },
    { currencies: { preferred_currencies: ['EURO'] } },
    { currencies: { default_currency: 123 } },
    { currencies: { default_currency: 'GB' } },
    { currencies: { default_currency: 'EURO' } },
    { currencies: 'GBP' },
    { currencies: [{ default_currency: 'GBP' }] },
    { date_format: 'invalid' },
    { date_format: 123 },
  ])('rejects malformed settings: %j', async (payload) => {
    await expect(validateSettings(payload)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it.each([
    { unexpected: true },
    { currencies: { preferred_currencies: ['GBP'], unexpected: true } },
  ])('rejects unknown fields: %j', async (payload) => {
    await expect(validateSettings(payload)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
