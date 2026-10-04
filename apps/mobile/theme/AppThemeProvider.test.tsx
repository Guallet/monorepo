import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { createElement, useEffect, useSyncExternalStore } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const native = vi.hoisted(() => ({
  system: 'light',
  override: 'unspecified',
  listeners: new Set<() => void>(),
}));
const showAlert = vi.hoisted(() => vi.fn());
vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Appearance: {
    setColorScheme: vi.fn((value: string) => {
      if (!['light', 'dark', 'unspecified'].includes(value)) {
        throw new Error('Unsupported React Native 0.86 appearance');
      }
      native.override = value;
      for (const listener of native.listeners) listener();
    }),
  },
  useColorScheme: () =>
    useSyncExternalStore(
      (listener) => {
        native.listeners.add(listener);
        return () => {
          native.listeners.delete(listener);
        };
      },
      () =>
        native.override === 'unspecified' ? native.system : native.override,
    ),
}));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn() },
}));
vi.mock('@guallet/luna-mobile', async () => {
  const { LunaProvider } =
    await import('../../../packages/guallet-luna-mobile/src/theme/ThemeProvider');
  const { useTheme } =
    await import('../../../packages/guallet-luna-mobile/src/theme/useTheme');
  return { LunaProvider, useTheme, useAlert: () => showAlert };
});
vi.mock('@guallet/luna-mobile/icons', () => ({ ThemeIcon: 'theme-icon' }));
vi.mock('@/components/ui/SelectionSheet', () => ({
  SelectionSheet: (props: object) => createElement('selection-sheet', props),
}));
vi.mock('../features/settings/components/SettingsRow', () => ({
  SettingsRow: (props: object) => createElement('settings-row', props),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { AppThemeProvider, useThemePreference } from './AppThemeProvider';
import { useThemeMode } from '../../../packages/guallet-luna-mobile/src/theme/ThemeProvider';
import { ThemePreferenceRow } from '../features/settings/components/ThemePreferenceRow';

let renderer: ReactTestRenderer;
let api: ReturnType<typeof useThemePreference>;
const mounted = vi.fn();

function Probe() {
  const context = useThemePreference();
  useEffect(() => {
    api = context;
  }, [context]);
  const mode = useThemeMode();
  useEffect(() => {
    mounted();
  }, []);
  return createElement('probe', { mode });
}

async function mount() {
  await act(async () => {
    renderer = create(
      <AppThemeProvider>
        <Probe />
        <ThemePreferenceRow />
      </AppThemeProvider>,
    );
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  Platform.OS = 'ios';
  native.system = 'light';
  native.override = 'unspecified';
  vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  vi.mocked(AsyncStorage.setItem).mockResolvedValue();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
  vi.useRealTimers();
});

describe('AppThemeProvider', () => {
  it('restores a saved override for Luna and native controls', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue('dark');
    await mount();
    expect(api.preference).toBe('dark');
    expect(renderer.root.findByType('probe').props.mode).toBe('dark');
    expect(Appearance.setColorScheme).toHaveBeenCalledWith('dark');
  });

  it('follows phone changes in System and resets a manual override', async () => {
    await mount();
    act(() => {
      native.system = 'dark';
      for (const listener of native.listeners) listener();
    });
    expect(renderer.root.findByType('probe').props.mode).toBe('dark');
    await act(async () => {
      await api.savePreference('light');
    });
    expect(renderer.root.findByType('probe').props.mode).toBe('light');
    await act(async () => {
      await api.savePreference('system');
    });
    expect(Appearance.setColorScheme).toHaveBeenLastCalledWith('unspecified');
    expect(renderer.root.findByType('probe').props.mode).toBe('dark');
    expect(mounted).toHaveBeenCalledOnce();
  });

  it('applies the override on web without calling unsupported native APIs', async () => {
    Platform.OS = 'web';
    vi.mocked(AsyncStorage.getItem).mockResolvedValue('dark');
    await mount();
    expect(renderer.root.findByType('probe').props.mode).toBe('dark');
    act(() => renderer.unmount());
    expect(Appearance.setColorScheme).not.toHaveBeenCalled();
  });

  it('does not apply a choice until it has been persisted', async () => {
    await mount();
    let finish!: () => void;
    vi.mocked(AsyncStorage.setItem).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    let saving!: Promise<void>;
    act(() => {
      saving = api.savePreference('dark');
    });
    expect(api.preference).toBe('system');
    await act(async () => {
      finish();
      await saving;
    });
    expect(api.preference).toBe('dark');
  });

  it('reports failed writes and keeps the previous theme', async () => {
    await mount();
    vi.mocked(AsyncStorage.setItem).mockRejectedValue(new Error('Disk full'));
    await act(async () => {
      renderer.root.findByType('selection-sheet').props.onSelect('dark');
    });
    expect(api.preference).toBe('system');
    expect(renderer.root.findByType('settings-row').props.disabled).toBe(false);
    expect(showAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Couldn’t save theme' }),
    );
  });

  it('does not let a late startup read overwrite a newer selection', async () => {
    vi.useFakeTimers();
    let finishRead!: (value: string) => void;
    vi.mocked(AsyncStorage.getItem).mockReturnValue(
      new Promise((resolve) => {
        finishRead = resolve;
      }),
    );
    await mount();
    expect(renderer.toJSON()).toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(api.preference).toBe('system');
    await act(async () => {
      await api.savePreference('light');
    });
    await act(async () => {
      finishRead('dark');
    });
    expect(api.preference).toBe('light');
    expect(renderer.root.findByType('probe').props.mode).toBe('light');
  });

  it('preserves the context identity when its parent rerenders', async () => {
    await mount();
    const previous = api;
    await act(async () => {
      renderer.update(
        <AppThemeProvider>
          <Probe />
          <ThemePreferenceRow />
        </AppThemeProvider>,
      );
    });
    expect(api).toBe(previous);
    act(() => renderer.unmount());
    expect(Appearance.setColorScheme).toHaveBeenLastCalledWith('unspecified');
  });
});
