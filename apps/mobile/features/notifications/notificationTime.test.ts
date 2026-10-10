import { describe, expect, it } from 'vitest';
import { notificationDate, notificationTime } from './notificationTime';
const now = Date.parse('2026-10-08T12:00:00Z');
describe('notification timestamps', () => {
  it('shows recent messages as relative time in the device locale', () => {
    expect(notificationTime('2026-10-08T11:50:00Z', 'en-GB', now)).toBe(
      '10 minutes ago',
    );
    expect(notificationTime('2026-10-08T10:00:00Z', 'en-GB', now)).toBe(
      '2 hours ago',
    );
    expect(notificationTime('2026-10-08T11:50:00Z', 'es-ES', now)).toBe(
      'hace 10 minutos',
    );
  });
  it('uses a full local timestamp for older messages', () => {
    expect(notificationTime('2026-10-06T10:00:00Z', 'en-GB', now)).toBe(
      notificationDate('2026-10-06T10:00:00Z', 'en-GB'),
    );
  });
  it('keeps invalid API dates readable', () => {
    expect(notificationDate('invalid', 'en-GB')).toBe('Date unavailable');
    expect(notificationTime('invalid', 'en-GB', now)).toBe('Date unavailable');
  });
});
