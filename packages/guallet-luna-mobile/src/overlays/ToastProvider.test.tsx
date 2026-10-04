import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LunaToast } from './toast.types';
import type { ToastQueue } from './ToastQueue';

const sonner = vi.hoisted(() => ({ custom: vi.fn(), dismiss: vi.fn() }));
vi.mock('sonner-native', () => ({ Toaster: 'toaster', toast: sonner }));
vi.mock('react-native-reanimated', () => ({
  FadeIn: { duration: () => 'fade-in' },
  FadeOut: { duration: () => 'fade-out' },
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 59, bottom: 34, left: 0, right: 0 }),
}));
vi.mock('react-native', () => ({
  AccessibilityInfo: { announceForAccessibility: vi.fn() },
  Platform: { OS: 'ios' },
  Pressable: 'pressable',
  Text: 'text',
  View: 'view',
  StyleSheet: { create: (styles: unknown) => styles },
}));
vi.mock('../icons', () => ({
  CheckIcon: 'check-icon',
  CloseIcon: 'close-icon',
  InfoIcon: 'info-icon',
  WarningIcon: 'warning-icon',
}));
vi.mock('../theme', async () => {
  const { DarkTheme, DefaultTheme } = await import('../theme/DefaultTheme');
  return {
    useTheme: vi.fn(() => DefaultTheme),
    useThemeMode: vi.fn(() => 'light'),
    DarkTheme,
  };
});

import { useContext, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useTheme } from '../theme';
import { DarkTheme } from '../theme/DefaultTheme';
import { ToastProvider, useToast } from './ToastProvider';
import { ToastCard } from './ToastCard';
import { ToastQueueContext } from './ToastContext';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
const rendered: ReactTestRenderer[] = [];
let api: LunaToast;
let queue: ToastQueue;

function Consumer() {
  const toast = useToast();
  const toastQueue = useContext(ToastQueueContext)!;
  useEffect(() => {
    api = toast;
    queue = toastQueue;
  }, [toast, toastQueue]);
  return null;
}

function mount() {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );
  });
  rendered.push(renderer);
  return renderer;
}

beforeEach(() => {
  sonner.custom.mockReset();
  sonner.dismiss.mockReset();
  vi.clearAllMocks();
});
afterEach(() => {
  for (const renderer of rendered.splice(0)) act(() => renderer.unmount());
});

describe('ToastProvider', () => {
  it('positions notifications below the safe area', () => {
    const host = mount().root.find((node) => String(node.type) === 'toaster');
    expect(host.props.position).toBe('top-center');
    expect(host.props.offset).toBe(67);
    expect(host.props.pauseWhenPageIsHidden).toBe(true);
    expect(host.props.allowFontScaling).toBe(true);
  });

  it('starts lifetimes only when displayed and advances on auto-close', () => {
    mount();
    act(() => queue.block('sheet'));
    act(() => {
      api.success('Saved');
      api.info('Deleted', { action: { label: 'Undo', onPress: vi.fn() } });
    });
    expect(sonner.custom).not.toHaveBeenCalled();
    act(() => queue.release('sheet'));
    expect(sonner.custom).toHaveBeenCalledOnce();
    const first = sonner.custom.mock.calls[0];
    expect(first[1].duration).toBe(4000);
    act(() => first[1].onAutoClose());
    expect(sonner.dismiss).toHaveBeenCalledWith(first[1].id);
    expect(sonner.custom.mock.calls[1][1].duration).toBe(8000);
  });

  it('restarts interrupted toasts and ignores their old callbacks', () => {
    mount();
    // Sonner invokes onAutoClose even when dismissed imperatively.
    sonner.dismiss.mockImplementation((id: string) => {
      const call = sonner.custom.mock.calls.find((entry) => entry[1].id === id);
      call?.[1].onAutoClose();
    });
    act(() => {
      api.error('Failed', { duration: 6000 });
    });
    const first = sonner.custom.mock.calls[0];
    act(() => queue.block('sheet'));
    expect(sonner.dismiss).toHaveBeenCalledWith(first[1].id);
    act(() => queue.release('sheet'));
    const resumed = sonner.custom.mock.calls[1];
    expect(resumed[1].duration).toBe(6000);
    expect(resumed[1].id).not.toBe(first[1].id);
    act(() => first[1].onAutoClose());
    expect(queue.getSnapshot()).not.toBeNull();
    act(() => resumed[1].onDismiss());
    expect(queue.getSnapshot()).toBeNull();
  });

  it('dismisses the Sonner presentation before invoking an action', () => {
    mount();
    const onPress = vi.fn(() => {
      expect(queue.getSnapshot()).toBeNull();
      expect(sonner.dismiss).toHaveBeenCalled();
    });
    act(() => {
      api.info('Deleted', { action: { label: 'Undo', onPress } });
    });
    const content = sonner.custom.mock.calls[0][0];
    act(() => content.props.onAction());
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('clears visible and queued messages without firing actions', () => {
    mount();
    const onPress = vi.fn();
    act(() => {
      api.warning('Offline', { action: { label: 'Retry', onPress } });
      api.info('Ready');
    });
    act(() => api.dismiss());
    expect(queue.getSnapshot()).toBeNull();
    expect(sonner.custom).toHaveBeenCalledOnce();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders accessible custom content with dark Luna tokens', () => {
    vi.mocked(useTheme).mockReturnValueOnce(DarkTheme);
    const onDismiss = vi.fn();
    const onAction = vi.fn();
    let card!: ReactTestRenderer;
    act(() => {
      card = create(
        <ToastCard
          message={{
            id: 'example',
            title: 'Export ready',
            description: 'Download your file',
            variant: 'info',
            action: { label: 'Download', onPress: vi.fn() },
          }}
          onDismiss={onDismiss}
          onAction={onAction}
        />,
      );
    });
    rendered.push(card);
    expect(card.root.findByType('view').props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: DarkTheme.colors.surface.background.primary,
      }),
    );
    expect(
      card.root.findByProps({ accessibilityRole: 'alert' }).props
        .accessibilityLabel,
    ).toBe('Export ready. Download your file');
    expect(
      card.root.findByProps({ accessibilityRole: 'alert' }).props
        .accessibilityLiveRegion,
    ).toBe('assertive');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Export ready. Download your file',
    );
    act(() =>
      card.root.findByProps({ accessibilityLabel: 'Download' }).props.onPress(),
    );
    act(() =>
      card.root
        .findByProps({ accessibilityLabel: 'Dismiss notification' })
        .props.onPress(),
    );
    expect(onAction).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
