import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  type SubscriptionDto,
} from '@guallet/api-client';
import RecurringDetailScreen from './RecurringDetailScreen';

const query = vi.hoisted(() => ({
  item: null as SubscriptionDto | null,
  isError: false,
  error: null as null | { status: number },
  remove: vi.fn(),
  refetch: vi.fn(),
}));
const router = vi.hoisted(() => ({ dismissTo: vi.fn(), push: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock('expo-router', () => ({ useRouter: () => router }));
vi.mock('react-native', () => ({
  View: 'view',
  Text: 'text',
  ScrollView: 'scroll-view',
  StyleSheet: { create: (styles: unknown) => styles },
}));
vi.mock('@guallet/api-react', () => ({
  useSubscription: () => ({
    subscription: query.item,
    isLoading: false,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }),
  useCategory: () => ({ category: null, isError: false }),
  useSubscriptionsMutations: () => ({
    deleteSubscriptionMutation: { isPending: false, mutateAsync: query.remove },
  }),
}));
vi.mock('@guallet/luna-mobile', async () => {
  const { createElement } = await import('react');
  const { DefaultTheme } =
    await import('../../../../../packages/guallet-luna-mobile/src/theme/DefaultTheme');
  return {
    useTheme: () => DefaultTheme,
    useToast: () => toast,
    BottomSheet: 'bottom-sheet',
    Button: (props: { children: React.ReactNode; onClick: () => void }) =>
      createElement('button', { ...props, onPress: props.onClick }),
  };
});
vi.mock('@/features/settings/useMobileUserPreferences', () => ({
  useMobileUserPreferences: () => ({ dateFormat: 'DD/MM/YYYY' }),
}));
vi.mock('../components/RecurringComponents', () => ({
  Amount: 'amount',
  Avatar: 'avatar',
  Card: 'card',
  Copy: 'copy',
  DetailValue: 'detail-value',
  Loading: 'loading',
  RecurringScreen: 'recurring-screen',
  Status: 'status',
}));
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let rendered: ReactTestRenderer;
beforeEach(() => {
  vi.clearAllMocks();
  query.item = {
    id: 'spotify',
    user_id: 'user',
    name: 'Spotify',
    amount: 10.99,
    currency: 'GBP',
    type: RecurringPaymentType.SUBSCRIPTION,
    cadence: RecurrenceCadence.MONTHLY,
  };
  query.isError = false;
  query.error = null;
  query.remove.mockResolvedValue(undefined);
});
afterEach(async () => {
  await act(async () => rendered?.unmount());
});
async function render() {
  await act(async () => {
    rendered = create(<RecurringDetailScreen id="spotify" />);
  });
}
function button(label: string) {
  return rendered.root.findAll(
    (node) => node.type === 'button' && node.props.children === label,
  )[0];
}
async function confirm() {
  await act(async () => {
    await rendered.root
      .findAll(
        (node) =>
          node.type === 'button' &&
          node.props.accessibilityLabel === 'Confirm removal from Guallet',
      )[0]
      .props.onPress();
  });
}
describe('recurring removal', () => {
  it('confirms local removal, explains provider cancellation and returns to the library', async () => {
    await render();
    await act(async () => button('Remove from Guallet').props.onPress());
    expect(
      rendered.root.find((node) => String(node.type) === 'bottom-sheet').props
        .isOpen,
    ).toBe(true);
    expect(JSON.stringify(rendered.toJSON())).toContain(
      'Your subscription with Spotify will continue.',
    );
    await confirm();
    expect(query.remove).toHaveBeenCalledWith({ id: 'spotify' });
    expect(router.dismissTo).toHaveBeenCalledWith('/recurring');
    expect(toast.success).toHaveBeenCalledOnce();
  });
  it('keeps the confirmation available after failure and allows retry', async () => {
    query.remove.mockRejectedValueOnce(new Error('Offline'));
    await render();
    await act(async () => button('Remove from Guallet').props.onPress());
    await confirm();
    expect(router.dismissTo).not.toHaveBeenCalled();
    expect(
      rendered.root.find((node) => String(node.type) === 'bottom-sheet').props
        .isOpen,
    ).toBe(true);
    expect(JSON.stringify(rendered.toJSON())).toContain(
      'Couldn’t remove this item.',
    );
    await confirm();
    expect(query.remove).toHaveBeenCalledTimes(2);
    expect(router.dismissTo).toHaveBeenCalledOnce();
  });
  it('treats a 404 as unavailable even if the query retains stale cached data', async () => {
    query.isError = true;
    query.error = { status: 404 };
    await render();
    expect(
      rendered.root.find((node) => String(node.type) === 'status').props.title,
    ).toBe('Item no longer available');
    expect(
      rendered.root.findAll((node) => String(node.type) === 'bottom-sheet'),
    ).toHaveLength(0);
  });
});
