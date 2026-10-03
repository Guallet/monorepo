import { Children, isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DateRangeSheetProps } from '../components/inputs/DateRangePicker/DateRangeSheetProvider';

vi.mock('@expo/ui', () => ({
  BottomSheet: 'native-sheet',
  RNHostView: 'native-host',
}));

vi.mock('react-native', () => ({
  Pressable: 'pressable',
  Text: 'text',
  View: 'view',
  StyleSheet: { create: (styles: unknown) => styles },
  useWindowDimensions: () => ({ width: 400 }),
}));

vi.mock('../icons', () => ({ CloseIcon: 'close-icon' }));
vi.mock('../theme', async () => {
  const { DefaultTheme } = await import('../theme/DefaultTheme');
  return { useTheme: () => DefaultTheme };
});

import { BottomSheet, LunaBottomSheetProvider } from './BottomSheet';

function findCloseButton(node: ReactNode): (() => void) | undefined {
  for (const child of Children.toArray(node)) {
    if (
      !isValidElement<{
        accessibilityLabel?: string;
        onPress?: () => void;
        children?: ReactNode;
      }>(child)
    ) {
      continue;
    }
    if (child.props.accessibilityLabel === 'Close bottom sheet') {
      return child.props.onPress;
    }
    const onPress = findCloseButton(child.props.children);
    if (onPress) return onPress;
  }
  return undefined;
}

describe('BottomSheet closing', () => {
  it('routes the shared close button and native dismissal to onClose', () => {
    let isBottomSheetOpen = true;
    const onClose = vi.fn(() => {
      isBottomSheetOpen = false;
    });
    const sheet = BottomSheet({
      isOpen: isBottomSheetOpen,
      title: 'Select an account',
      showCloseIcon: true,
      onClose,
    });

    const pressClose = findCloseButton(sheet);
    expect(pressClose).toBeDefined();
    pressClose?.();
    expect(isBottomSheetOpen).toBe(false);

    isBottomSheetOpen = true;
    sheet.props.onDismiss();
    expect(isBottomSheetOpen).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('preserves an additional native dismissal callback', () => {
    const onClose = vi.fn();
    const onDismiss = vi.fn();
    const sheet = BottomSheet({
      isOpen: true,
      title: 'Options',
      onClose,
      onDismiss,
    });

    sheet.props.onDismiss();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(findCloseButton(sheet)).toBeUndefined();
  });

  it('calls a shared close and dismissal callback only once per dismissal', () => {
    const onClose = vi.fn();
    const sheet = BottomSheet({
      isOpen: true,
      title: 'Options',
      onClose,
      onDismiss: onClose,
    });

    sheet.props.onDismiss();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('connects picker cancellation to the shared close button', () => {
    const onDismiss = vi.fn();
    const provider = LunaBottomSheetProvider({ children: null });
    const adaptedSheet = provider.props.sheet({
      visible: true,
      title: 'Date range',
      showCloseIcon: true,
      onDismiss,
      children: null,
      snapPoints: ['full'],
    });
    const sheetElement = adaptedSheet.type(
      adaptedSheet.props as DateRangeSheetProps,
    );
    const sheet = BottomSheet(sheetElement.props);

    expect(sheet.props.isPresented).toBe(true);
    findCloseButton(sheet)?.();
    expect(onDismiss).toHaveBeenCalledOnce();
    sheet.props.onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });
});
