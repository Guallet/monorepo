import { describe, expect, expectTypeOf, it, vi } from 'vitest';

const { setItem } = vi.hoisted(() => ({ setItem: vi.fn() }));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { setItem },
}));
vi.mock('@guallet/api-react', () => ({}));
vi.mock('@guallet/auth', () => ({}));

import { watchImportJob } from './ImportJobMonitor';

describe('mobile import job registration', () => {
  it('does not wait for a pending storage write', async () => {
    setItem.mockImplementation(() => new Promise(() => {}));

    expectTypeOf(watchImportJob).returns.toEqualTypeOf<void>();
    watchImportJob('job-1', 'user-1');
    await Promise.resolve();

    expect(setItem).toHaveBeenCalledWith(
      'guallet:pending-import-jobs:user-1',
      '["job-1"]',
    );
  });
});
