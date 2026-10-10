import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ View: 'view' }));
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'safe-area',
}));
vi.mock('expo-router', () => ({ Stack: { Screen: 'stack-screen' } }));
vi.mock('@guallet/luna-mobile', () => ({
  ModalLoaderOverlay: 'loader',
  useTheme: () => ({
    colors: {
      surface: { background: { primary: 'surface', page: 'page' } },
      text: { primary: 'text' },
    },
  }),
}));

import { AppScreen } from './AppScreen';

describe('AppScreen safe-area ownership', () => {
  it('leaves the top inset to a visible stack header', () => {
    const screen = AppScreen({ children: 'content' });
    expect(screen.props.children[2].props.edges).toEqual([
      'left',
      'right',
      'bottom',
    ]);
    expect(screen.props.children[2].props.children).toBe('content');
  });

  it('protects all edges when the stack header is hidden', () => {
    const screen = AppScreen({ isHeaderVisible: false });
    expect(screen.props.children[2].props.edges).toEqual([
      'top',
      'left',
      'right',
      'bottom',
    ]);
  });

  it('uses the effective header options when choosing inset ownership', () => {
    const screen = AppScreen({ headerOptions: { headerShown: false } });
    expect(screen.props.children[2].props.edges).toContain('top');
  });

  it('lets a navigator own selected edges and forwards view props', () => {
    const screen = AppScreen({
      safeAreaEdges: ['left', 'right'],
      testID: 'screen',
      accessibilityLabel: 'Screen',
    });
    expect(screen.props.children[2].props.edges).toEqual(['left', 'right']);
    expect(screen.props.testID).toBe('screen');
    expect(screen.props.accessibilityLabel).toBe('Screen');
  });
});
