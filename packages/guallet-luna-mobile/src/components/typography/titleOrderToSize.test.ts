import { describe, expect, it } from 'vitest';
import { titleOrderToSize } from './titleOrderToSize';

describe('titleOrderToSize', () => {
  it('maps each title order to a distinct typography size', () => {
    expect(titleOrderToSize).toEqual({
      1: 'xxl',
      2: 'xl',
      3: 'lg',
      4: 'md',
      5: 'sm',
      6: 'xs',
    });
  });
});
