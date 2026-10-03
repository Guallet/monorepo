import { Children, isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

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

import { BottomSheet } from './BottomSheet';

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

describe('BottomSheet', () => {
  it('lets the consumer close and reopen the controlled sheet', () => {
    let isBottomSheetOpen = true;
    const onClose = vi.fn(() => {
      isBottomSheetOpen = false;
    });
    const sheet = BottomSheet({
      isOpen: isBottomSheetOpen,
      title: 'Select an account',
      showCloseIcon: true,
      onClose,
      onDismiss: onClose,
    });

    const pressClose = findCloseButton(sheet);
    expect(pressClose).toBeDefined();
    pressClose?.();
    expect(isBottomSheetOpen).toBe(false);
    expect(
      BottomSheet({
        isOpen: isBottomSheetOpen,
        title: 'Select an account',
        onDismiss: onClose,
      }).props.isPresented,
    ).toBe(false);

    isBottomSheetOpen = true;
    const reopenedSheet = BottomSheet({
      isOpen: isBottomSheetOpen,
      title: 'Select an account',
      onDismiss: onClose,
    });
    expect(reopenedSheet.props.isPresented).toBe(true);
    reopenedSheet.props.onDismiss();
    expect(isBottomSheetOpen).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('keeps close icon presses separate from native dismissal', () => {
    const onClose = vi.fn();
    const onDismiss = vi.fn();
    const sheet = BottomSheet({
      isOpen: true,
      title: 'Options',
      showCloseIcon: true,
      onClose,
      onDismiss,
    });

    findCloseButton(sheet)?.();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onDismiss).not.toHaveBeenCalled();

    sheet.props.onDismiss();
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('supports dismissal without a close icon or onClose callback', () => {
    const onDismiss = vi.fn();
    const sheet = BottomSheet({
      isOpen: true,
      title: 'Options',
      onDismiss,
    });

    expect(findCloseButton(sheet)).toBeUndefined();
    sheet.props.onDismiss();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it.each([
    { padding: 12, expectedWidth: 376 },
    { padding: { left: 8, right: 24 }, expectedWidth: 368 },
    { padding: 250, expectedWidth: 0 },
  ])(
    'bounds content width with padding $padding',
    ({ padding, expectedWidth }) => {
      const sheet = BottomSheet({
        isOpen: true,
        title: 'Options',
        onDismiss: vi.fn(),
        contentPadding: padding,
        children: 'Picker content',
      });
      const host = sheet.props.children;
      expect(host.type).toBe('native-host');
      expect(host.props.matchContents).toBe(true);
      const content = host.props.children;
      expect(content.props.collapsable).toBe(false);
      expect(content.props.style).toContainEqual({ width: expectedWidth });
      expect(Children.toArray(content.props.children)).toHaveLength(2);
      expect(content.props.children[1].props.children).toBe('Picker content');
    },
  );

  it('uses the native content bridge for a full-height sheet', () => {
    const sheet = BottomSheet({
      isOpen: true,
      title: 'Categories',
      onDismiss: vi.fn(),
      snapPoints: ['full'],
    });

    expect(sheet.props.snapPoints).toEqual(['full']);
    const host = sheet.props.children;
    expect(host.type).toBe('native-host');
    expect(host.props.matchContents).toBe(false);
    expect(host.props.children.props.collapsable).toBe(false);
    expect(host.props.children.props.style).toContainEqual({
      flexGrow: 1,
      height: 0,
    });
  });
});
