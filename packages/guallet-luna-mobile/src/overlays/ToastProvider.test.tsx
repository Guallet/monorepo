import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LunaToast } from './toast.types';
import type { ToastQueue } from './ToastQueue';

const appState = vi.hoisted(() => ({
  currentState: 'active',
  listeners: new Set<(state: string) => void>(),
}));
function changeAppState(state: string) {
  appState.currentState = state;
  act(() => {
    for (const listener of appState.listeners) listener(state);
  });
}
const sonner = vi.hoisted(() => ({ custom: vi.fn(), dismiss: vi.fn() }));
vi.mock('sonner-native', () => ({ Toaster: 'toaster', toast: sonner }));
vi.mock('react-native-gesture-handler', () => ({ ScrollView: 'scroll-view' }));
vi.mock('react-native-reanimated', () => ({
  FadeIn: { duration: () => 'fade-in' },
  FadeOut: { duration: () => 'fade-out' },
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 59, bottom: 34, left: 0, right: 0 }),
}));
vi.mock('react-native', () => ({
  AppState: {
    get currentState() {
      return appState.currentState;
    },
    addEventListener: (_event: string, listener: (state: string) => void) => {
      appState.listeners.add(listener);
      return { remove: () => appState.listeners.delete(listener) };
    },
  },
  useWindowDimensions: vi.fn(() => ({
    width: 320,
    height: 568,
    fontScale: 2,
    scale: 1,
  })),
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
import { AccessibilityInfo, useWindowDimensions } from 'react-native';
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
  appState.currentState = 'active';
  sonner.custom.mockReset();
  sonner.dismiss.mockReset();
  vi.clearAllMocks();
});
afterEach(() => {
  for (const renderer of rendered.splice(0)) act(() => renderer.unmount());
});

describe('ToastProvider', () => {
  it('defers background messages until foregrounded, preserving order', () => {
    appState.currentState = 'background';
    mount();
    act(() => {
      api.success('Saved');
      api.info('Synced');
    });
    expect(sonner.custom).not.toHaveBeenCalled();
    changeAppState('inactive');
    expect(sonner.custom).not.toHaveBeenCalled();
    changeAppState('active');
    expect(sonner.custom.mock.calls[0][0].props.message.title).toBe('Saved');
    act(() => sonner.custom.mock.calls[0][1].onAutoClose());
    expect(sonner.custom.mock.calls[1][0].props.message.title).toBe('Synced');
  });

  it('hides active messages in the background and waits for sheets too', () => {
    mount();
    act(() => {
      api.info('Ready', { duration: 6000 });
    });
    const original = sonner.custom.mock.calls[0];
    changeAppState('background');
    expect(sonner.dismiss).toHaveBeenCalledWith(original[1].id);
    act(() => queue.block('sheet'));
    changeAppState('active');
    expect(sonner.custom).toHaveBeenCalledOnce();
    act(() => queue.release('sheet'));
    expect(sonner.custom.mock.calls[1][1].duration).toBe(6000);
    act(() => original[1].onAutoClose());
    expect(queue.getSnapshot()?.message.title).toBe('Ready');
  });

  it('clears messages while backgrounded and removes its AppState listener', () => {
    const tree = mount();
    changeAppState('background');
    act(() => {
      api.info('Ready');
      api.dismiss();
    });
    changeAppState('active');
    expect(sonner.custom).not.toHaveBeenCalled();
    act(() => tree.unmount());
    rendered.splice(rendered.indexOf(tree), 1);
    expect(appState.listeners.size).toBe(0);
  });

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

  it.each([
    { width: 320, height: 568 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
  ])(
    'bounds long content in a $width by $height window',
    ({ width, height }) => {
      vi.mocked(useWindowDimensions).mockReturnValueOnce({
        width,
        height,
        fontScale: 2,
        scale: 1,
      });
      let card!: ReactTestRenderer;
      act(() => {
        card = create(
          <ToastCard
            message={{
              id: 'long',
              title: 'A long notification',
              description: 'Long text. '.repeat(200),
              variant: 'info',
              action: { label: 'Undo', onPress: vi.fn() },
            }}
            onDismiss={vi.fn()}
            onAction={vi.fn()}
          />,
        );
      });
      rendered.push(card);
      const styles = card.root.findByType('view').props.style;
      expect(styles).toContainEqual(expect.objectContaining({ maxWidth: 600 }));
      expect(styles).toContainEqual(
        expect.objectContaining({
          width: width - 32,
          maxHeight: Math.min(height - 59 - 34 - 16, height * 0.6),
        }),
      );
      const scroll = card.root.find(
        (node) => String(node.type) === 'scroll-view',
      );
      expect(
        scroll.findAllByProps({ accessibilityRole: 'button' }),
      ).toHaveLength(0);
      expect(
        card.root.findByProps({ accessibilityLabel: 'Undo' }),
      ).toBeDefined();
      expect(
        card.root.findByProps({ accessibilityLabel: 'Dismiss notification' }),
      ).toBeDefined();
    },
  );

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
      expect.objectContaining({ width: 288, maxHeight: 568 * 0.6 }),
    );
    const scroll = card.root.find(
      (node) => String(node.type) === 'scroll-view',
    );
    expect(scroll.props.nestedScrollEnabled).toBe(true);
    expect(scroll.props.disallowInterruption).toBe(true);
    expect(scroll.findAllByProps({ accessibilityRole: 'button' })).toHaveLength(
      0,
    );

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
