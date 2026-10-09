import React, { act } from 'react';
import { create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  params: { email: 'prefilled@example.com' },
}));

vi.mock('@/auth/useAuth', () => ({ useAuth: () => ({ login: mocks.login }) }));
vi.mock('@/components/forms', () => import('../../../components/forms'));
vi.mock('@/features/login/components/AuthLayout', () => ({
  AuthIntro: 'header',
  AuthLink: 'a',
  AuthNotice: 'aside',
  AuthScreen: 'main',
}));
vi.mock('@expo/vector-icons/Ionicons', () => ({ default: 'icon' }));
vi.mock('expo-router', () => ({
  useLocalSearchParams: () => mocks.params,
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}));
vi.mock('react-native', () => ({
  Pressable: 'span',
  View: 'view',
  StyleSheet: { create: (styles: unknown) => styles },
}));
vi.mock('@guallet/luna-mobile', () => ({
  Button: 'button',
  Stack: 'stack',
  TextInput: ({ rightSection, ...props }: { rightSection?: React.ReactNode }) =>
    React.createElement('input', props, rightSection),
  useTheme: () => ({
    colors: { text: { secondary: '#444' } },
    spacing: { xs: 4 },
  }),
}));

import { PasswordLoginScreen } from './PasswordLoginScreen';

let renderer: ReactTestRenderer;

function input(label: string) {
  return renderer.root
    .findAll((node) => node.type === 'input')
    .find((node) => node.props.label === label)!;
}

function button() {
  return renderer.root.find((node) => node.type === 'button');
}

async function change(label: string, value: string) {
  await act(async () => input(label).props.onChangeText(value));
}

async function submitFromKeyboard() {
  await act(async () => input('Password').props.onSubmitEditing());
}

beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.clearAllMocks();
  mocks.login.mockResolvedValue({ success: true, error: null });
  await act(async () => {
    renderer = create(<PasswordLoginScreen />);
  });
});

afterEach(async () => {
  await act(async () => renderer.unmount());
});

describe('password login with shared mobile forms', () => {
  it('prefills the email and keeps the blank password secure', () => {
    expect(input('Email address').props.value).toBe('prefilled@example.com');
    expect(input('Password').props.value).toBe('');
    expect(input('Password').props.secureTextEntry).toBe(true);
    expect(input('Email address').props.error).toBeUndefined();
    expect(button().props.disabled).toBe(true);
  });

  it('blocks invalid keyboard submissions and revalidates corrections', async () => {
    await change('Email address', 'invalid');
    await change('Password', '123');
    await submitFromKeyboard();

    expect(mocks.login).not.toHaveBeenCalled();
    expect(input('Email address').props.error).toBe(
      'Enter a valid email address.',
    );
    expect(input('Password').props.error).toBe(
      'Password must be at least 6 characters.',
    );
    expect(input('Password').props.accessibilityHint).toBe(
      input('Password').props.error,
    );

    await change('Email address', 'valid@example.com');
    await change('Password', '123456');
    expect(input('Email address').props.error).toBeUndefined();
    expect(input('Password').props.error).toBeUndefined();
    expect(button().props.disabled).toBe(false);
    await act(async () => button().props.onClick());
    expect(mocks.login).toHaveBeenCalledWith('valid@example.com', '123456');
  });

  it('trims email, preserves password, and guards pending button/keyboard submissions', async () => {
    const result = Promise.withResolvers<{ success: boolean; error: null }>();
    mocks.login.mockReturnValue(result.promise);
    await change('Email address', '  valid@example.com  ');
    await change('Password', ' secret ');
    await act(async () => {
      button().props.onClick();
      button().props.onClick();
    });
    await submitFromKeyboard();

    expect(mocks.login).toHaveBeenCalledTimes(1);
    expect(mocks.login).toHaveBeenCalledWith('valid@example.com', ' secret ');
    expect(button().props.disabled).toBe(true);
    expect(button().props.children).toBe('Signing in…');
    expect(input('Password').props.disabled).toBe(true);
    expect(
      renderer.root.find((node) => node.type === 'main').props.isLoading,
    ).toBe(true);

    await act(async () => result.resolve({ success: true, error: null }));
    expect(button().props.disabled).toBe(false);
    expect(
      renderer.root.find((node) => node.type === 'main').props.isLoading,
    ).toBe(false);
  });

  it('shows auth errors and clears them on editing', async () => {
    mocks.login.mockResolvedValue({
      success: false,
      error: { message: 'Invalid credentials' },
    });
    await change('Password', '123456');
    await submitFromKeyboard();
    expect(
      renderer.root.find((node) => node.type === 'aside').props.children,
    ).toBe('Invalid credentials');
    expect(button().props.disabled).toBe(false);

    await change('Password', 'corrected');
    expect(renderer.root.findAll((node) => node.type === 'aside')).toHaveLength(
      0,
    );
    mocks.login.mockResolvedValue({ success: true, error: null });
    await submitFromKeyboard();
    expect(mocks.login).toHaveBeenCalledTimes(2);
  });

  it('recovers from a thrown request and allows retry', async () => {
    mocks.login.mockRejectedValue(new Error('Network unavailable'));
    await change('Password', '123456');
    await submitFromKeyboard();
    expect(
      renderer.root.find((node) => node.type === 'aside').props.children,
    ).toBe('We could not sign you in. Check your details and try again.');
    expect(button().props.disabled).toBe(false);
  });

  it('retains password visibility and passes the current email to alternative routes', async () => {
    const toggle = renderer.root.find((node) => node.type === 'span');
    await act(async () => toggle.props.onPress());
    expect(input('Password').props.secureTextEntry).toBe(false);
    expect(toggle.props.accessibilityLabel).toBe('Hide password');
    await change('Email address', '  edited@example.com  ');
    const links = renderer.root.findAll((node) => node.type === 'a');
    await act(async () => links[0]!.props.onPress());
    await act(async () => links[1]!.props.onPress());
    expect(mocks.push).toHaveBeenCalledWith({
      pathname: '/login/forgot-password',
      params: { email: 'edited@example.com' },
    });
    expect(mocks.replace).toHaveBeenCalledWith({
      pathname: '/login/email-code',
      params: { email: 'edited@example.com' },
    });
  });
});
