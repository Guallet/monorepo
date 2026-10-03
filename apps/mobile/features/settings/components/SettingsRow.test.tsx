import { Children } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  ActivityIndicator: 'activity-indicator',
  Pressable: 'pressable',
  Text: 'text',
  View: 'view',
  StyleSheet: { create: (styles: unknown) => styles },
}));

vi.mock('@/components/ui/icon-symbol', () => ({
  IconSymbol: 'icon-symbol',
}));

vi.mock('@guallet/luna-mobile', async () => {
  const { DefaultTheme } =
    await import('../../../../../packages/guallet-luna-mobile/src/theme/DefaultTheme');
  return { useTheme: () => DefaultTheme };
});

import { SettingsRow } from './SettingsRow';

const defaultProps = {
  icon: null,
  label: 'Export data',
  onPress: () => {},
};

describe('SettingsRow', () => {
  it('has no navigation accessory by default', () => {
    const row = SettingsRow(defaultProps);

    expect(row.props.accessibilityLabel).toBe('Export data');
    expect(row.props.accessibilityRole).toBe('button');
    expect(row.props.children[1].props.children).toBe('Export data');
    expect(Children.toArray(row.props.children[2].props.children)).toHaveLength(
      0,
    );
  });

  it('shows a navigation chevron when requested without requiring a value', () => {
    const row = SettingsRow({ ...defaultProps, showChevron: true });
    const accessory = row.props.children[2].props.children[1];

    expect(accessory.type).toBe('icon-symbol');
    expect(accessory.props.name).toBe('chevron.right');
  });

  it('shows the value on the right without implicitly adding a chevron', () => {
    const row = SettingsRow({ ...defaultProps, value: 'Receive by email' });

    const [value, accessory] = row.props.children[2].props.children;
    expect(value.props.children).toBe('Receive by email');
    expect(value.props.numberOfLines).toBe(1);
    expect(value.props.style).toContainEqual({
      maxWidth: 128,
      textAlign: 'right',
    });
    expect(accessory).toBeNull();
    expect(row.props.accessibilityValue).toEqual({ text: 'Receive by email' });
  });

  it('shows both the value and chevron when showChevron is true', () => {
    const row = SettingsRow({
      ...defaultProps,
      value: 'Receive by email',
      showChevron: true,
    });
    const [value, accessory] = row.props.children[2].props.children;

    expect(value.props.children).toBe('Receive by email');
    expect(accessory.type).toBe('icon-symbol');
    expect(accessory.props.name).toBe('chevron.right');
  });

  it('supports a defined empty value', () => {
    const row = SettingsRow({ ...defaultProps, value: '' });

    expect(row.props.children[2].props.children[0].props.children).toBe('');
    expect(row.props.accessibilityValue).toEqual({ text: '' });
  });

  it('shows loading instead of the navigation chevron and exposes busy state', () => {
    const row = SettingsRow({
      ...defaultProps,
      showChevron: true,
      isLoading: true,
      value: 'Receive by email',
    });

    expect(row.props.children[2].props.children[0].props.children).toBe(
      'Receive by email',
    );
    expect(row.props.children[2].props.children[1].type).toBe(
      'activity-indicator',
    );
    expect(row.props.accessibilityState).toEqual({
      busy: true,
      disabled: false,
    });
  });

  it('passes the disabled state to the native control and accessibility', () => {
    const row = SettingsRow({ ...defaultProps, disabled: true });

    expect(row.props.disabled).toBe(true);
    expect(row.props.accessibilityState).toEqual({
      busy: false,
      disabled: true,
    });
  });

  it('calls the action when the native control is pressed', () => {
    const onPress = vi.fn();
    const row = SettingsRow({ ...defaultProps, onPress, showChevron: true });

    row.props.onPress();

    expect(onPress).toHaveBeenCalledOnce();
  });
});
