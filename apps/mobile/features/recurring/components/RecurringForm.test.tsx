import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecurrenceCadence, RecurringPaymentType } from '@guallet/api-client';
import { RecurringForm } from './RecurringForm';

const api = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  pending: false,
}));
const nav = vi.hoisted(() => ({
  back: vi.fn(),
  replace: vi.fn(),
  dispatch: vi.fn(),
}));
const guard = vi.hoisted(() => ({
  enabled: false,
  callback: null as null | ((event: { data: { action: object } }) => void),
}));
const feedback = vi.hoisted(() => ({ alert: vi.fn(), success: vi.fn() }));
vi.mock('expo-router', () => ({
  useRouter: () => nav,
  useNavigation: () => nav,
}));
vi.mock('expo-router/react-navigation', () => ({
  useHeaderHeight: () => 64,
  usePreventRemove: (enabled: boolean, callback: typeof guard.callback) => {
    guard.enabled = enabled;
    guard.callback = callback;
  },
}));
vi.mock('react-native', () => ({
  Keyboard: { dismiss: vi.fn() },
  Platform: { OS: 'ios' },
  Pressable: 'pressable',
  Text: 'text',
  View: 'view',
  ScrollView: 'scroll-view',
  KeyboardAvoidingView: 'keyboard-view',
  StyleSheet: { create: (styles: unknown) => styles },
}));
vi.mock('@guallet/luna-mobile', async () => {
  const { createElement } = await import('react');
  const { DefaultTheme } =
    await import('../../../../../packages/guallet-luna-mobile/src/theme/DefaultTheme');
  return {
    useTheme: () => DefaultTheme,
    useAlert: () => feedback.alert,
    useToast: () => feedback,
    TextInput: 'text-input',
    DateInput: 'date-input',
    BottomSheet: 'bottom-sheet',
    Button: (props: { children: string; onClick: () => void }) =>
      createElement('button', { ...props, onPress: props.onClick }),
  };
});
vi.mock('@guallet/luna-mobile/icons', () => ({
  CheckIcon: 'check-icon',
  ChevronDownIcon: 'chevron-icon',
}));
vi.mock('@guallet/api-react', () => ({
  useCategories: () => ({
    categories: [],
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useSubscriptionsMutations: () => ({
    createSubscriptionMutation: {
      isPending: api.pending,
      mutateAsync: api.create,
    },
    updateSubscriptionMutation: {
      isPending: api.pending,
      mutateAsync: api.update,
    },
  }),
}));
vi.mock('@/features/settings/useMobileUserPreferences', () => ({
  useMobileUserPreferences: () => ({
    defaultCurrency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
  }),
}));
vi.mock('@/components/AmountInput', () => ({ AmountInput: 'amount-input' }));
vi.mock('@/components/category-picker/CategoryPicker', () => ({
  CategoryPicker: 'category-picker',
}));
vi.mock('./RecurringComponents', () => ({ Choice: 'choice', Copy: 'copy' }));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let rendered: ReactTestRenderer;
async function render(props: React.ComponentProps<typeof RecurringForm> = {}) {
  await act(async () => {
    rendered = create(<RecurringForm {...props} />);
  });
}
async function fill() {
  await act(async () => {
    rendered.root
      .findByProps({ label: 'Name' })
      .props.onChangeText(' Spotify ');
    rendered.root.findByProps({ label: 'Amount paid' }).props.onChange(10.99);
  });
}
async function press(label: string) {
  const button = rendered.root.findAll(
    (node) => node.type === 'button' && node.props.children === label,
  )[0];
  await act(async () => {
    await button.props.onPress();
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  api.pending = false;
  api.create.mockResolvedValue({ id: 'new' });
  api.update.mockResolvedValue({ id: 'existing' });
});
afterEach(async () => {
  await act(async () => rendered?.unmount());
});

describe('recurring form mutations and navigation', () => {
  it('creates an undated item with trimmed name and returns to its saved details', async () => {
    await render();
    await fill();
    expect(guard.enabled).toBe(true);
    await press('Save recurring item');
    expect(api.create).toHaveBeenCalledWith({
      request: {
        name: 'Spotify',
        amount: 10.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        startDate: null,
        categoryId: undefined,
      },
    });
    expect(nav.replace).toHaveBeenCalledWith({
      pathname: '/recurring/[id]',
      params: { id: 'new' },
    });
    expect(guard.enabled).toBe(false);
  });
  it('validates before calling the API', async () => {
    await render();
    await press('Save recurring item');
    expect(api.create).not.toHaveBeenCalled();
    expect(rendered.root.findByProps({ label: 'Name' }).props.error).toBe(
      'Enter a name.',
    );
  });
  it('uses the income filter and encodes picked dates without a timezone shift', async () => {
    await render({ initialType: RecurringPaymentType.REGULAR_INCOME });
    await act(async () => {
      rendered.root.findByProps({ label: 'Name' }).props.onChangeText('Salary');
      rendered.root
        .findByProps({ label: 'Amount received' })
        .props.onChange(2400);
      rendered.root
        .findByProps({ label: 'First payment date · Optional' })
        .props.onChange(new Date(2026, 9, 15));
    });
    await press('Save recurring item');
    expect(api.create).toHaveBeenCalledWith({
      request: expect.objectContaining({
        type: RecurringPaymentType.REGULAR_INCOME,
        startDate: '2026-10-15',
      }),
    });
  });
  it('clears date/category on update while retaining unedited image metadata', async () => {
    await render({
      item: {
        id: 'existing',
        user_id: 'user',
        name: 'Spotify',
        amount: 10.99,
        currency: 'GBP',
        cadence: RecurrenceCadence.MONTHLY,
        type: RecurringPaymentType.SUBSCRIPTION,
        startDate: '2025-10-10',
        categoryId: 'category',
        imageUrl: 'https://example.com/image.png',
      },
    });
    await act(async () => {
      rendered.root
        .findByProps({ label: 'First payment date · Optional' })
        .props.onChange(null);
      rendered.root
        .findByProps({ selectionMode: 'single' })
        .props.onChange(null);
    });
    await press('Save changes');
    expect(api.update).toHaveBeenCalledWith({
      id: 'existing',
      request: expect.objectContaining({ startDate: null, categoryId: null }),
    });
    expect(api.update.mock.calls[0][0].request).not.toHaveProperty('imageUrl');
    expect(nav.back).toHaveBeenCalledOnce();
  });
  it('preserves input after a failed mutation and lets the user retry', async () => {
    api.create.mockRejectedValueOnce(new Error('Offline'));
    await render();
    await fill();
    await press('Save recurring item');
    expect(nav.replace).not.toHaveBeenCalled();
    expect(rendered.root.findByProps({ label: 'Name' }).props.value).toBe(
      ' Spotify ',
    );
    await press('Save recurring item');
    expect(api.create).toHaveBeenCalledTimes(2);
    expect(nav.replace).toHaveBeenCalledOnce();
  });
  it('asks before discarding a modified form and dispatches the confirmed action', async () => {
    await render();
    expect(guard.enabled).toBe(false);
    await fill();
    guard.callback!({ data: { action: { type: 'GO_BACK' } } });
    expect(feedback.alert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Discard changes?' }),
    );
    feedback.alert.mock.calls[0][0].actions[1].onPress();
    expect(nav.dispatch).toHaveBeenCalledWith({ type: 'GO_BACK' });
  });
});
