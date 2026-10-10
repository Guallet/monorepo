import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Pressable: 'pressable',
  ScrollView: 'scroll-view',
  Text: 'text',
  View: 'view',
  StyleSheet: { create: (styles: unknown) => styles, hairlineWidth: 1 },
}));
vi.mock('@guallet/luna-mobile/icons', () => ({ CheckIcon: 'check-icon' }));
vi.mock('@guallet/luna-mobile', async () => {
  const { DefaultTheme } =
    await import('../../../../packages/guallet-luna-mobile/src/theme/DefaultTheme');
  return { useTheme: () => DefaultTheme, BottomSheet: 'bottom-sheet' };
});

import { SelectionSheet } from './SelectionSheet';
let renderer: ReactTestRenderer;
beforeEach(() => Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }));
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
});

describe('SelectionSheet', () => {
  it('exposes selection state and lets large labels wrap', () => {
    act(() => {
      renderer = create(
        <SelectionSheet
          visible
          title="Theme"
          options={[
            { id: 'system', label: 'System' },
            { id: 'dark', label: 'Dark' },
          ]}
          selectedId="dark"
          onSelect={() => {}}
          onClose={() => {}}
        />,
      );
    });
    const rows = renderer.root.findAllByType('pressable');
    expect(rows.map((row) => row.props.accessibilityState.checked)).toEqual([
      false,
      true,
    ]);
    expect(rows.map((row) => row.props.accessibilityRole)).toEqual([
      'radio',
      'radio',
    ]);
    expect(
      renderer.root.findByType('check-icon').props.importantForAccessibility,
    ).toBe('no');
    for (const label of renderer.root.findAllByType('text')) {
      expect(label.props.numberOfLines).toBeUndefined();
    }
  });

  it('closes without waiting for asynchronous work, including the None option', () => {
    const events: string[] = [];
    const onSelect = vi.fn(() => {
      events.push('select');
      return new Promise<void>(() => {});
    });
    act(() => {
      renderer = create(
        <SelectionSheet
          visible
          title="Category"
          options={[]}
          allowNone
          selectedId={null}
          onSelect={onSelect}
          onClose={() => events.push('close')}
        />,
      );
    });
    act(() => renderer.root.findByType('pressable').props.onPress());
    expect(onSelect).toHaveBeenCalledWith(null);
    expect(events).toEqual(['select', 'close']);
  });
});
