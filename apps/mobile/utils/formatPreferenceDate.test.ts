import { describe, expect, it } from 'vitest';
import {
  endOfPreferenceDay,
  formatPreferenceDate,
} from './formatPreferenceDate';

describe('calendar deadlines', () => {
  it('displays the API calendar date independently of its UTC instant', () => {
    expect(formatPreferenceDate('2030-01-02T00:00:00.000Z', 'DD/MM/YYYY')).toBe(
      '02/01/2030',
    );
  });

  it('normalizes a picked deadline to the end of its API calendar day', () => {
    const date = new Date(2030, 0, 2, 7, 30);
    const deadline = endOfPreferenceDay(date);
    expect(deadline.getUTCDate()).toBe(2);
    expect(deadline.getUTCHours()).toBe(23);
    expect(deadline.getUTCMinutes()).toBe(59);
    expect(deadline.getUTCSeconds()).toBe(59);
    expect(deadline.getUTCMilliseconds()).toBe(999);
    expect(date.getHours()).toBe(7);
    expect(formatPreferenceDate(deadline.toISOString(), 'DD/MM/YYYY')).toBe(
      '02/01/2030',
    );
  });
});
