import { Children, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@expo/ui', async () => {
  const { createElement, useState } = await import('react');
  return {
    BottomSheet: (props: { isPresented: boolean; children?: ReactNode }) => {
      const [mounted, setMounted] = useState(props.isPresented);
      if (props.isPresented && !mounted) setMounted(true);
      return createElement(
        'native-sheet',
        {
          ...props,
          onDismissComplete: () => setMounted(false),
        },
        mounted ? props.children : null,
      );
    },
    RNHostView: 'native-host',
  };
});

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

import { ToastQueue } from './ToastQueue';
import { ToastQueueContext } from './ToastContext';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
const rendered: ReactTestRenderer[] = [];

function renderSheet(
  props: Parameters<typeof BottomSheet>[0],
  queue?: ToastQueue,
) {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <ToastQueueContext.Provider value={queue ?? null}>
        <BottomSheet {...props} />
      </ToastQueueContext.Provider>,
    );
  });
  rendered.push(renderer);
  return renderer.root.find((node) => String(node.type) === 'native-sheet');
}

function findCloseButton(node: ReturnType<typeof renderSheet>) {
  return node.findAllByProps({ accessibilityLabel: 'Close bottom sheet' })[0]
    ?.props.onPress;
}

afterEach(() => {
  for (const renderer of rendered.splice(0)) act(() => renderer.unmount());
});

describe('BottomSheet', () => {
  it('lets the consumer close and reopen the controlled sheet', () => {
    let isBottomSheetOpen = true;
    const onClose = vi.fn(() => {
      isBottomSheetOpen = false;
    });
    const sheet = renderSheet({
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
      renderSheet({
        isOpen: isBottomSheetOpen,
        title: 'Select an account',
        onDismiss: onClose,
      }).props.isPresented,
    ).toBe(false);

    isBottomSheetOpen = true;
    const reopenedSheet = renderSheet({
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
    const sheet = renderSheet({
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
    const sheet = renderSheet({
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
      const sheet = renderSheet({
        isOpen: true,
        title: 'Options',
        onDismiss: vi.fn(),
        contentPadding: padding,
        children: 'Picker content',
      });
      const host = sheet.find((node) => String(node.type) === 'native-host');
      expect(host.type).toBe('native-host');
      expect(host.props.matchContents).toBe(true);
      const content = host.props.children;
      expect(content.props.collapsable).toBe(false);
      expect(content.props.style).toContainEqual({ width: expectedWidth });
      expect(Children.toArray(content.props.children)).toHaveLength(3);
      expect(content.props.children[2].props.children).toBe('Picker content');
    },
  );

  it('uses the native content bridge for a full-height sheet', () => {
    const sheet = renderSheet({
      isOpen: true,
      title: 'Categories',
      onDismiss: vi.fn(),
      snapPoints: ['full'],
    });

    expect(sheet.props.snapPoints).toEqual(['full']);
    const host = sheet.find((node) => String(node.type) === 'native-host');
    expect(host.type).toBe('native-host');
    expect(host.props.matchContents).toBe(false);
    expect(host.props.children.props.collapsable).toBe(false);
    expect(host.props.children.props.style).toContainEqual({
      flexGrow: 1,
      height: 0,
    });
  });
  it('holds toasts until native content unmounts after dismissal completes', () => {
    const queue = new ToastQueue();
    const onDismiss = vi.fn();
    const props = { isOpen: true, title: 'Options', onDismiss };
    const sheet = renderSheet(props, queue);
    const id = queue.enqueue('success', 'Saved');
    expect(queue.getSnapshot()).toBeNull();
    act(() => sheet.props.onDismiss());
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(queue.getSnapshot()).toBeNull();
    act(() =>
      rendered.at(-1)!.update(
        <ToastQueueContext.Provider value={queue}>
          <BottomSheet {...props} isOpen={false} />
        </ToastQueueContext.Provider>,
      ),
    );
    expect(queue.getSnapshot()).toBeNull();
    act(() => sheet.props.onDismissComplete());
    expect(queue.getSnapshot()?.message.id).toBe(id);
  });

  it('releases a sheet hold if its owner unmounts', () => {
    const queue = new ToastQueue();
    renderSheet({ isOpen: true, title: 'Options', onDismiss: vi.fn() }, queue);
    const id = queue.enqueue('info', 'Ready');
    expect(queue.getSnapshot()).toBeNull();
    act(() => rendered.pop()!.unmount());
    expect(queue.getSnapshot()?.message.id).toBe(id);
  });
});
