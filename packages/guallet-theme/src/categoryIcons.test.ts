import { describe, expect, it } from 'vitest';
import {
  categoryIconFallbackName,
  categoryIconNames,
  isCategoryIconName,
  selectableCategoryIconNames,
} from './categoryIcons';

describe('category icon contract', () => {
  it('recognises supported persisted names', () => {
    expect(isCategoryIconName('IconCash')).toBe(true);
    expect(isCategoryIconName('IconNotSharedByLuna')).toBe(false);
    expect(isCategoryIconName(null)).toBe(false);
  });

  it('only exposes selectable icons that are supported', () => {
    expect(
      selectableCategoryIconNames.every((name) =>
        categoryIconNames.includes(name),
      ),
    ).toBe(true);
  });

  it('uses a supported fallback icon', () => {
    expect(categoryIconNames).toContain(categoryIconFallbackName);
  });
});
