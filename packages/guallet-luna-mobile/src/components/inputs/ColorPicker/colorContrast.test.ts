import { describe, expect, it } from 'vitest';
import { shouldUseDarkCheck } from './colorContrast';

const darkInk = 0xff003087;
const lightInk = 0xffffffff;

describe('shouldUseDarkCheck', () => {
  it('uses dark ink on light swatches and light ink on dark swatches', () => {
    expect(shouldUseDarkCheck(0xffffffff, 0xffffffff, darkInk, lightInk)).toBe(
      true,
    );
    expect(shouldUseDarkCheck(0xff25262b, 0xffffffff, darkInk, lightInk)).toBe(
      false,
    );
  });

  it('composites transparent swatches against the sheet background', () => {
    expect(shouldUseDarkCheck(0x00000000, 0xffffffff, darkInk, lightInk)).toBe(
      true,
    );
    expect(shouldUseDarkCheck(0x00000000, 0xff121820, darkInk, lightInk)).toBe(
      false,
    );
  });
});
