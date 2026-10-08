import { useEffect } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createClient,
  NotificationType,
  type NotificationDto,
} from '@guallet/api-client';
import {
  QueryClient,
  QueryClientProvider,
  GualletClientProvider,
  useNotificationMutations,
  useNotifications,
  useNotification,
} from '@guallet/api-react';
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_NOTIFICATIONS_QUERY_KEY,
} from '../../../../packages/guallet-api-react/src/notifications/notificationCache';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
const first: NotificationDto = {
  id: 'first',
  message: 'Review transactions',
  icon: null,
  type: NotificationType.INFO,
  action: null,
  isRead: false,
  createdAt: '2026-10-08T09:00:00Z',
};
const rendered: ReactTestRenderer[] = [];
const caches: QueryClient[] = [];
function setup() {
  const client = createClient({ baseUrl: 'https://unused.invalid' });
  const cache = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  caches.push(cache);
  let mutations!: ReturnType<typeof useNotificationMutations>;
  function Harness() {
    const value = useNotificationMutations();
    useEffect(() => {
      mutations = value;
    }, [value]);
    return null;
  }
  act(() => {
    rendered.push(
      create(
        <QueryClientProvider client={cache}>
          <GualletClientProvider client={client}>
            <Harness />
          </GualletClientProvider>
        </QueryClientProvider>,
      ),
    );
  });
  cache.setQueryData([NOTIFICATIONS_QUERY_KEY], [first]);
  cache.setQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY], [first]);
  return { client, cache, mutations };
}
afterEach(() => {
  rendered.splice(0).forEach((ui) => act(() => ui.unmount()));
  caches.splice(0).forEach((cache) => cache.clear());
  vi.restoreAllMocks();
});
describe('notification mutations', () => {
  it('keeps the original list and unread count when the update request fails', async () => {
    const { client, cache, mutations } = setup();
    vi.spyOn(client.notifications, 'update').mockRejectedValue(
      new Error('Offline'),
    );
    await act(async () => {
      await expect(
        mutations.markAsReadMutation.mutateAsync({
          id: first.id,
          isRead: true,
        }),
      ).rejects.toThrow('Offline');
    });
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY])).toEqual([first]);
    expect(cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY])).toEqual([
      first,
    ]);
  });
  it('prevents an already running unread query from restoring a message after Mark as read', async () => {
    const { client, cache, mutations } = setup();
    let finish!: (notifications: NotificationDto[]) => void;
    const stale = cache.fetchQuery({
      queryKey: [UNREAD_NOTIFICATIONS_QUERY_KEY],
      queryFn: () =>
        new Promise<NotificationDto[]>((resolve) => {
          finish = resolve;
        }),
    });
    // The cancelled fetch rejects; consume it before the mutation cancels it.
    const completed = stale.catch(() => undefined);
    vi.spyOn(client.notifications, 'update').mockResolvedValue({
      ...first,
      isRead: true,
    });
    await act(async () => {
      await mutations.markAsReadMutation.mutateAsync({
        id: first.id,
        isRead: true,
      });
    });
    finish([first]);
    await completed;
    expect(cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY])).toEqual([]);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toEqual({
      ...first,
      isRead: true,
    });
  });
  it('preserves notifications arriving while a bulk read request is running', async () => {
    const { client, cache, mutations } = setup();
    let finish!: () => void;
    vi.spyOn(client.notifications, 'markAllAsRead').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    let request!: Promise<void>;
    await act(async () => {
      request = mutations.markAllAsReadMutation.mutateAsync();
    });
    const incoming = {
      ...first,
      id: 'incoming',
      createdAt: '2026-10-08T10:00:00Z',
    };
    cache.setQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY], [incoming, first]);
    cache.setQueryData([NOTIFICATIONS_QUERY_KEY], [incoming, first]);
    await act(async () => {
      finish();
      await request;
    });
    expect(cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY])).toEqual([
      incoming,
    ]);
  });
  it('removes a deleted notification from history, unread and detail only after success', async () => {
    const { client, cache, mutations } = setup();
    const remove = vi
      .spyOn(client.notifications, 'delete')
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(undefined);
    cache.setQueryData([NOTIFICATIONS_QUERY_KEY, first.id], first);
    await act(async () => {
      await expect(
        mutations.deleteMutation.mutateAsync(first.id),
      ).rejects.toThrow('Offline');
    });
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toEqual(
      first,
    );
    await act(async () => {
      await mutations.deleteMutation.mutateAsync(first.id);
    });
    expect(remove).toHaveBeenCalledTimes(2);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY])).toEqual([]);
    expect(cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY])).toEqual([]);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toBeNull();
  });
  it('does not prime stale detail data from a cancelled history fetch', async () => {
    const { client, cache, mutations } = setup();
    let finish!: (notifications: NotificationDto[]) => void;
    const read = { ...first, isRead: true };
    vi.spyOn(client.notifications, 'getAll')
      .mockImplementationOnce(
        () =>
          new Promise<NotificationDto[]>((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue([read]);
    vi.spyOn(client.notifications, 'update').mockResolvedValue(read);
    function History() {
      useNotifications();
      return null;
    }
    act(() => {
      rendered.push(
        create(
          <QueryClientProvider client={cache}>
            <GualletClientProvider client={client}>
              <History />
            </GualletClientProvider>
          </QueryClientProvider>,
        ),
      );
    });
    await act(async () => {
      await mutations.markAsReadMutation.mutateAsync({
        id: first.id,
        isRead: true,
      });
    });
    await act(async () => {
      finish([first]);
    });
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toEqual(
      read,
    );
  });

  it('keeps an unread dashboard message readable when its detail request fails', async () => {
    const { client, cache } = setup();
    let message: NotificationDto | null = null;
    vi.spyOn(client.notifications, 'get').mockRejectedValue(
      new Error('Offline'),
    );
    function Detail() {
      const { notification } = useNotification(first.id);
      useEffect(() => {
        message = notification;
      }, [notification]);
      return null;
    }
    await act(async () => {
      rendered.push(
        create(
          <QueryClientProvider client={cache}>
            <GualletClientProvider client={client}>
              <Detail />
            </GualletClientProvider>
          </QueryClientProvider>,
        ),
      );
    });
    expect(message).toEqual(first);
  });
  it('finishes a confirmed write while the following refresh is still pending', async () => {
    const { client, cache, mutations } = setup();
    vi.spyOn(client.notifications, 'getAll').mockImplementation(
      () => new Promise<NotificationDto[]>(() => {}),
    );
    vi.spyOn(client.notifications, 'update').mockResolvedValue({
      ...first,
      isRead: true,
    });
    function History() {
      useNotifications();
      return null;
    }
    act(() => {
      rendered.push(
        create(
          <QueryClientProvider client={cache}>
            <GualletClientProvider client={client}>
              <History />
            </GualletClientProvider>
          </QueryClientProvider>,
        ),
      );
    });
    await act(async () => {
      await mutations.markAsReadMutation.mutateAsync({
        id: first.id,
        isRead: true,
      });
    });
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toEqual({
      ...first,
      isRead: true,
    });
    expect(cache.isFetching()).toBe(1);
  });
});
