import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockMutateAsync = jest.fn();
const mockRouterBack = jest.fn();

const mockAccounts = [
  { id: 'acc-1', name: 'Current Account', currency: 'GBP' },
  { id: 'acc-2', name: 'Savings', currency: 'USD' },
];

const mockCategories = [
  { id: 'cat-1', name: 'Food', parentId: null },
  { id: 'cat-2', name: 'Transport', parentId: null },
];

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
      <View><Text>{headerTitle}</Text>{children}</View>
    ),
  };
});

jest.mock('@guallet/api-react', () => ({
  useTransactionMutations: () => ({
    createTransactionMutation: { mutateAsync: mockMutateAsync },
  }),
  useAccounts: () => ({ accounts: mockAccounts }),
  useCategories: () => ({ categories: mockCategories }),
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
    ListRow: ({ title, onPress, right }: any) => (
      <TouchableOpacity onPress={onPress} testID={`listrow-${title}`}>
        <Text>{title}</Text>
        {right}
      </TouchableOpacity>
    ),
    useTheme: () => ({ spacing: { md: 16 } }),
  };
});

import { AddTransactionScreen } from '@/features/transactions/screens/AddTransactionScreen';

describe('AddTransactionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  function pressSubmitButton() {
    const buttons = screen.getAllByText('Add Transaction');
    fireEvent.press(buttons[buttons.length - 1]);
  }

  it('renders the screen with correct title', () => {
    render(<AddTransactionScreen />);
    expect(screen.getAllByText('Add Transaction').length).toBeGreaterThanOrEqual(1);
  });

  it('renders type toggle buttons', () => {
    render(<AddTransactionScreen />);
    expect(screen.getByText('Expense')).toBeTruthy();
    expect(screen.getByText('Income')).toBeTruthy();
  });

  it('renders form fields', () => {
    render(<AddTransactionScreen />);
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('Amount')).toBeTruthy();
    expect(screen.getByText('Notes (optional)')).toBeTruthy();
  });

  it('renders account list', () => {
    render(<AddTransactionScreen />);
    expect(screen.getByText('Current Account')).toBeTruthy();
    expect(screen.getByText('Savings')).toBeTruthy();
  });

  it('renders category list with no-category option', () => {
    render(<AddTransactionScreen />);
    expect(screen.getByText('No category')).toBeTruthy();
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Transport')).toBeTruthy();
  });

  it('shows validation error when description is empty', async () => {
    render(<AddTransactionScreen />);
    pressSubmitButton();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Description is required.',
      );
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows validation error when no account is selected', async () => {
    render(<AddTransactionScreen />);
    fireEvent.changeText(screen.getByTestId('input-Description'), 'Test');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '10');
    pressSubmitButton();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Please select an account.',
      );
    });
  });

  it('shows validation error for invalid amount', async () => {
    render(<AddTransactionScreen />);
    fireEvent.changeText(screen.getByTestId('input-Description'), 'Test');
    // Select an account
    fireEvent.press(screen.getByTestId('listrow-Current Account'));
    // Leave amount empty/invalid
    pressSubmitButton();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Please enter a valid amount.',
      );
    });
  });

  it('creates expense transaction with negative amount', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddTransactionScreen />);

    fireEvent.changeText(screen.getByTestId('input-Description'), 'Groceries');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '50');
    fireEvent.press(screen.getByTestId('listrow-Current Account'));
    pressSubmitButton();

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 'acc-1',
          description: 'Groceries',
          amount: -50, // Expense = negative
        }),
      );
    });
  });

  it('creates income transaction with positive amount', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddTransactionScreen />);

    // Switch to income
    fireEvent.press(screen.getByText('Income'));
    fireEvent.changeText(screen.getByTestId('input-Description'), 'Salary');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '3000');
    fireEvent.press(screen.getByTestId('listrow-Current Account'));
    pressSubmitButton();

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 'acc-1',
          description: 'Salary',
          amount: 3000, // Income = positive
        }),
      );
    });
  });

  it('navigates back after successful creation', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddTransactionScreen />);

    fireEvent.changeText(screen.getByTestId('input-Description'), 'Test');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '10');
    fireEvent.press(screen.getByTestId('listrow-Current Account'));
    pressSubmitButton();

    await waitFor(() => {
      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  it('shows error on mutation failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('fail'));
    render(<AddTransactionScreen />);

    fireEvent.changeText(screen.getByTestId('input-Description'), 'Test');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '10');
    fireEvent.press(screen.getByTestId('listrow-Current Account'));
    pressSubmitButton();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to create transaction. Please try again.',
      );
    });
  });

  it('navigates back when Cancel is pressed', () => {
    render(<AddTransactionScreen />);
    fireEvent.press(screen.getByText('Cancel'));
    expect(mockRouterBack).toHaveBeenCalled();
  });
});
