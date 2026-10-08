import { createElement, type ReactElement, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  NotificationType,
  type NotificationDto,
} from '@guallet/api-client';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
  setRead: vi.fn(),
  remove: vi.fn(),
  markAllRead: vi.fn(),
  refetch: vi.fn(),
  query: {
    notifications: [] as NotificationDto[],
    data: undefined as NotificationDto[] | undefined,
    isError: false,
    isPending: false,
    isRefetching: false,
  },
  notification: null as NotificationDto | null,
  detailError: null as Error | null,
}));

vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  return {
    View: 'view',
    Text: 'text',
    Pressable: 'pressable',
    ScrollView: 'scroll-view',
    RefreshControl: 'refresh-control',
    StyleSheet: { create: (s: unknown) => s },
    FlatList: ({
      data,
      renderItem,
      ListHeaderComponent,
      ListEmptyComponent,
    }: {
      data: NotificationDto[];
      renderItem: (value: { item: NotificationDto }) => ReactNode;
      ListHeaderComponent: ReactNode;
      ListEmptyComponent: ReactNode;
    }) =>
      createElement(
        'list',
        null,
        ListHeaderComponent,
        data.map((item) =>
          createElement('list-item', { key: item.id }, renderItem({ item })),
        ),
        data.length === 0 && ListEmptyComponent,
      ),
  };
});
vi.mock('expo-router', () => ({
  useRouter: () => ({ push: mocks.push, back: mocks.back }),
  useLocalSearchParams: () => ({ id: 'first' }),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 24, left: 0, right: 0 }),
}));
vi.mock('@guallet/api-react', () => ({
  useNotifications: () => ({ ...mocks.query, refetch: mocks.refetch }),
  useNotification: () => ({
    notification: mocks.notification,
    isPending: false,
    isError: mocks.detailError !== null,
    error: mocks.detailError,
    refetch: mocks.refetch,
  }),
}));
vi.mock('@guallet/luna-mobile', async () => {
  const { DefaultTheme } =
    await import('../../../../packages/guallet-luna-mobile/src/theme/DefaultTheme');
  return {
    useTheme: () => DefaultTheme,
    useToast: () => mocks.toast,
    BottomSheet: ({ children, ...props }: { children: ReactNode }) =>
      createElement(
        'sheet',
        { ...props, onDismiss: (props as { onClose?: () => void }).onClose },
        children,
      ),
  };
});
vi.mock('@guallet/luna-mobile/icons', () => ({
  BellIcon: 'bell',
  InfoIcon: 'info',
  WarningIcon: 'warning',
  ImportantIcon: 'important',
  ActionRequiredIcon: 'action-required',
  MoreIcon: 'more',
  CheckIcon: 'check',
}));
vi.mock('@/components/layout/AppScreen', () => ({
  AppScreen: ({ children }: { children: ReactNode }) =>
    createElement('screen', null, children),
}));
vi.mock('@/features/settings/useMobileUserPreferences', () => ({
  useMobileUserPreferences: () => ({ languageTag: 'en-GB' }),
}));
vi.mock('./useNotificationActions', () => ({
  useNotificationActions: () => ({
    setRead: mocks.setRead,
    remove: mocks.remove,
    markAllRead: mocks.markAllRead,
    isUpdating: false,
    isDeleting: false,
  }),
}));

import { NotificationOptionsSheet } from './components/NotificationOptionsSheet';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NotificationDetailsScreen } from './screens/NotificationDetailsScreen';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
const rendered: ReactTestRenderer[] = [];
const first: NotificationDto = {
  id: 'first',
  message: 'Review imported transactions',
  icon: null,
  type: NotificationType.ACTION_REQUIRED,
  action: '/transactions/inbox',
  isRead: false,
  createdAt: '2026-10-08T09:00:00Z',
};
function render(ui: ReactElement) {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(ui);
  });
  rendered.push(renderer);
  return renderer;
}
function button(renderer: ReactTestRenderer, label: string) {
  return renderer.root.findAll(
    (node) =>
      String(node.type) === 'pressable' &&
      node.props.accessibilityLabel === label,
  )[0];
}
afterEach(() => {
  for (const renderer of rendered.splice(0)) act(() => renderer.unmount());
  vi.clearAllMocks();
  mocks.notification = null;
  mocks.detailError = null;
  mocks.query = {
    notifications: [],
    data: undefined,
    isError: false,
    isPending: false,
    isRefetching: false,
  };
});

describe('notification management', () => {
  it('requires a second, explicit delete action and allows cancellation', async () => {
    const remove = vi.fn().mockResolvedValue(true);
    const close = vi.fn();
    const ui = render(
      <NotificationOptionsSheet
        notification={first}
        onClose={close}
        pending={false}
        onSetRead={vi.fn()}
        onDelete={remove}
      />,
    );
    act(() => button(ui, 'Delete notification').props.onPress());
    expect(remove).not.toHaveBeenCalled();
    expect(
      ui.root.find((node) => String(node.type) === 'sheet').props.title,
    ).toBe('Delete notification?');
    act(() => button(ui, 'Cancel').props.onPress());
    expect(close).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();
  });
  it('keeps the sheet available on delete failure and closes only after success', async () => {
    const remove = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const close = vi.fn();
    const ui = render(
      <NotificationOptionsSheet
        notification={first}
        confirmDelete
        onClose={close}
        pending={false}
        onSetRead={vi.fn()}
        onDelete={remove}
      />,
    );
    await act(async () => button(ui, 'Delete').props.onPress());
    expect(close).not.toHaveBeenCalled();
    await act(async () => button(ui, 'Delete').props.onPress());
    expect(close).toHaveBeenCalledOnce();
  });
  it('offers Mark as unread for read messages and leaves read state alone on dismissal', () => {
    const setRead = vi.fn();
    const close = vi.fn();
    const ui = render(
      <NotificationOptionsSheet
        notification={{ ...first, isRead: true }}
        onClose={close}
        pending={false}
        onSetRead={setRead}
        onDelete={vi.fn()}
      />,
    );
    expect(button(ui, 'Mark as unread')).toBeDefined();
    act(() =>
      ui.root.find((node) => String(node.type) === 'sheet').props.onDismiss(),
    );
    expect(close).toHaveBeenCalledOnce();
    expect(setRead).not.toHaveBeenCalled();
  });
  it('shows read controls disabled while a request is pending', () => {
    const ui = render(
      <NotificationOptionsSheet
        notification={first}
        onClose={vi.fn()}
        pending
        onSetRead={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(button(ui, 'Mark as read').props.disabled).toBe(true);
    expect(button(ui, 'Delete notification').props.disabled).toBe(true);
  });
});

describe('inbox and detail flows', () => {
  it('filters Unread, retains that selection when emptied and returns to All', () => {
    const read = { ...first, id: 'second', isRead: true };
    mocks.query = {
      ...mocks.query,
      notifications: [first, read],
      data: [first, read],
    };
    const ui = render(<NotificationsScreen />);
    expect(
      ui.root.findAll((node) => String(node.type) === 'list-item'),
    ).toHaveLength(2);
    act(() => button(ui, 'Unread (1)').props.onPress());
    expect(
      ui.root.findAll((node) => String(node.type) === 'list-item'),
    ).toHaveLength(1);
    mocks.query = {
      ...mocks.query,
      notifications: [{ ...first, isRead: true }, read],
      data: [],
    };
    act(() => ui.update(<NotificationsScreen />));
    expect(
      ui.root.findAll((node) => String(node.type) === 'list-item'),
    ).toHaveLength(0);
    expect(button(ui, 'Unread (0)').props.accessibilityState.selected).toBe(
      true,
    );
    act(() => button(ui, 'View all notifications').props.onPress());
    expect(
      ui.root.findAll((node) => String(node.type) === 'list-item'),
    ).toHaveLength(2);
  });
  it('does not offer a false empty inbox on first-load failure', () => {
    mocks.query.isError = true;
    const ui = render(<NotificationsScreen />);
    expect(button(ui, 'Try again')).toBeDefined();
    expect(button(ui, 'Unread (0)')).toBeUndefined();
  });
  it('marks the detail read once and does not reverse a user’s Mark as unread', async () => {
    mocks.setRead.mockResolvedValue(true);
    mocks.notification = first;
    const ui = render(<NotificationDetailsScreen />);
    expect(mocks.setRead).toHaveBeenCalledWith(first.id, true, false);
    mocks.notification = { ...first, isRead: true };
    act(() => ui.update(<NotificationDetailsScreen />));
    await act(async () => button(ui, 'Mark as unread').props.onPress());
    mocks.notification = first;
    act(() => ui.update(<NotificationDetailsScreen />));
    expect(mocks.setRead).toHaveBeenCalledTimes(2);
    expect(mocks.setRead).toHaveBeenLastCalledWith(first.id, false);
  });
  it('keeps unsupported destinations readable without a navigation button', () => {
    mocks.notification = { ...first, isRead: true };
    const ui = render(<NotificationDetailsScreen />);
    expect(button(ui, 'View details')).toBeUndefined();
    expect(button(ui, 'Delete notification')).toBeDefined();
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it('opens a validated equivalent mobile destination', () => {
    mocks.notification = { ...first, isRead: true, action: '/transactions' };
    const ui = render(<NotificationDetailsScreen />);
    act(() => button(ui, 'View details').props.onPress());
    expect(mocks.push).toHaveBeenCalledWith({
      pathname: '/(protected)/(tabs)/transactions',
    });
  });
  it('removes management controls when a cached notification no longer exists on the server', () => {
    mocks.notification = { ...first, isRead: true };
    mocks.detailError = new ApiError('Not found', 404);
    const ui = render(<NotificationDetailsScreen />);
    expect(button(ui, 'Delete notification')).toBeUndefined();
    expect(button(ui, 'Mark as unread')).toBeUndefined();
  });
});
