import { describe, expect, it } from 'vitest';
import { formatMortgageMoney } from './mortgageCurrency';

describe('mortgage money formatting', () => {
  it('uses currency-specific minor units', () => {
    expect(formatMortgageMoney(123.456, 'JPY')).not.toMatch(/\.\d/);
    expect(formatMortgageMoney(123.456, 'KWD')).toContain('123.456');
  });
});
