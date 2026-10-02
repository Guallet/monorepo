import { ValidationPipe } from '@nestjs/common';
import { DataExportRequestDto } from './data-export-request.dto';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

function validate(body: Record<string, unknown>) {
  return pipe.transform(body, {
    type: 'body',
    metatype: DataExportRequestDto,
  });
}

describe('DataExportRequestDto', () => {
  it('accepts the mobile request through the API whitelist', async () => {
    await expect(
      validate({
        startDate: '2026-08-31T14:00:00.000Z',
        endDate: '2026-09-30T13:59:59.999Z',
        accounts: ['account-1'],
        format: 'csv',
      }),
    ).resolves.toMatchObject({
      startDate: '2026-08-31T14:00:00.000Z',
      endDate: '2026-09-30T13:59:59.999Z',
      accounts: ['account-1'],
      format: 'csv',
    });
  });

  it('rejects unknown fields and invalid dates', async () => {
    await expect(validate({ unexpected: true })).rejects.toThrow();
    await expect(validate({ startDate: 'not-a-date' })).rejects.toThrow();
  });
});
