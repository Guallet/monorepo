import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Setup mocks before importing components
const mockMutateAsync = jest.fn();
const mockRouterBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: jest.fn() }),
  Stack: { Screen: () => null },
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('@/components/layout/AppScreen', () => {
  const { View, Text } = require('react-native');
  return {
    AppScreen: ({ children, headerTitle }: any) => (
      <View>
        <Text>{headerTitle}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock('@guallet/api-react', () => ({
  useAccountMutations: () => ({
    createAccountMutation: { mutateAsync: mockMutateAsync },
  }),
}));

jest.mock('@luna-ui/react-native', () => {
  const { View, Text, TouchableOpacity, TextInput: RNTextInput } = require('react-native');
  return {
    Button: ({ children, onClick, disabled }: any) => (
      <TouchableOpacity onPress={onClick} disabled={disabled} accessibilityRole="button">
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </TouchableOpacity>
    ),
    TextInput: ({ label, value, onChangeText, placeholder, ...props }: any) => (
      <View>
        {label && <Text>{label}</Text>}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          testID={`input-${label}`}
          {...props}
        />
      </View>
    ),
    Section: ({ title, children }: any) => (
      <View><Text>{title}</Text>{children}</View>
    ),
    useTheme: () => ({
      spacing: { md: 16 },
    }),
  };
});

import { AddAccountScreen } from '@/features/accounts/screens/AddAccountScreen';

describe('AddAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders the screen with correct title', () => {
    render(<AddAccountScreen />);
    expect(screen.getByText('Add Account')).toBeTruthy();
  });

  it('renders all form fields', () => {
    render(<AddAccountScreen />);
    expect(screen.getByText('Account Name')).toBeTruthy();
    expect(screen.getByText('Account Type')).toBeTruthy();
    expect(screen.getByText('Currency')).toBeTruthy();
    expect(screen.getByText('Initial Balance')).toBeTruthy();
  });

  it('renders all account type buttons', () => {
    render(<AddAccountScreen />);
    expect(screen.getByText('Current Account')).toBeTruthy();
    expect(screen.getByText('Credit Card')).toBeTruthy();
    expect(screen.getByText('Savings')).toBeTruthy();
    expect(screen.getByText('Investment')).toBeTruthy();
    expect(screen.getByText('Mortgage')).toBeTruthy();
    expect(screen.getByText('Loan')).toBeTruthy();
    expect(screen.getByText('Pension')).toBeTruthy();
  });

  it('renders Create Account and Cancel buttons', () => {
    render(<AddAccountScreen />);
    expect(screen.getByText('Create Account')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('shows validation error when name is empty', async () => {
    render(<AddAccountScreen />);
    fireEvent.press(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Account name is required.',
      );
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('calls mutation with correct data on valid submission', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddAccountScreen />);

    fireEvent.changeText(screen.getByTestId('input-Account Name'), 'My Account');
    fireEvent.press(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        request: expect.objectContaining({
          name: 'My Account',
          type: 'current-account',
          currency: 'GBP',
          initial_balance: 0,
          create_balance_transaction: true,
        }),
      });
    });
  });

  it('navigates back after successful creation', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddAccountScreen />);

    fireEvent.changeText(screen.getByTestId('input-Account Name'), 'My Account');
    fireEvent.press(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  it('shows error alert on mutation failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Network error'));
    render(<AddAccountScreen />);

    fireEvent.changeText(screen.getByTestId('input-Account Name'), 'My Account');
    fireEvent.press(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to create account. Please try again.',
      );
    });
  });

  it('navigates back when Cancel is pressed', () => {
    render(<AddAccountScreen />);
    fireEvent.press(screen.getByText('Cancel'));
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it('trims whitespace from name before submitting', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddAccountScreen />);

    fireEvent.changeText(screen.getByTestId('input-Account Name'), '  My Account  ');
    fireEvent.press(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        request: expect.objectContaining({
          name: 'My Account',
        }),
      });
    });
  });
});
