import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockMutateAsync = jest.fn();
const mockRouterBack = jest.fn();

const mockCategories = [
  { id: 'cat-1', name: 'Food', parentId: null },
  { id: 'cat-2', name: 'Transport', parentId: null },
  { id: 'cat-3', name: 'Entertainment', parentId: null },
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
  useBudgetMutations: () => ({
    createBudgetMutation: { mutateAsync: mockMutateAsync },
  }),
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

import { CreateBudgetScreen } from '@/features/budgets/screens/CreateBudgetScreen';

describe('CreateBudgetScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  function pressSubmitButton() {
    const buttons = screen.getAllByText('Create Budget');
    fireEvent.press(buttons[buttons.length - 1]);
  }

  it('renders the screen with correct title', () => {
    render(<CreateBudgetScreen />);
    expect(screen.getAllByText('Create Budget').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all form fields', () => {
    render(<CreateBudgetScreen />);
    expect(screen.getByText('Budget Name')).toBeTruthy();
    expect(screen.getByText('Amount')).toBeTruthy();
    expect(screen.getByText('Currency')).toBeTruthy();
  });

  it('renders categories for selection', () => {
    render(<CreateBudgetScreen />);
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Transport')).toBeTruthy();
    expect(screen.getByText('Entertainment')).toBeTruthy();
  });

  it('renders Create Budget and Cancel buttons', () => {
    render(<CreateBudgetScreen />);
    expect(screen.getAllByText('Create Budget').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('shows validation error when name is empty', async () => {
    render(<CreateBudgetScreen />);
    pressSubmitButton();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Budget name is required.',
      );
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid amount', async () => {
    render(<CreateBudgetScreen />);
    fireEvent.changeText(screen.getByTestId('input-Budget Name'), 'Food Budget');
    pressSubmitButton();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Please enter a valid budget amount.',
      );
    });
  });

  it('shows validation error when no categories selected', async () => {
    render(<CreateBudgetScreen />);
    fireEvent.changeText(screen.getByTestId('input-Budget Name'), 'Food Budget');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '500');
    pressSubmitButton();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Please select at least one category for the budget.',
      );
    });
  });

  it('creates budget with correct data on valid submission', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<CreateBudgetScreen />);

    fireEvent.changeText(screen.getByTestId('input-Budget Name'), 'Food Budget');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '500');
    // Select a category
    fireEvent.press(screen.getByTestId('listrow-Food'));
    pressSubmitButton();

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        request: expect.objectContaining({
          name: 'Food Budget',
          amount: 500,
          currency: 'GBP',
          categories: ['cat-1'],
        }),
      });
    });
  });

  it('allows toggling multiple categories', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<CreateBudgetScreen />);

    fireEvent.changeText(screen.getByTestId('input-Budget Name'), 'Budget');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '500');
    // Select two categories
    fireEvent.press(screen.getByTestId('listrow-Food'));
    fireEvent.press(screen.getByTestId('listrow-Transport'));
    pressSubmitButton();

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        request: expect.objectContaining({
          categories: ['cat-1', 'cat-2'],
        }),
      });
    });
  });

  it('allows deselecting a category', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<CreateBudgetScreen />);

    fireEvent.changeText(screen.getByTestId('input-Budget Name'), 'Budget');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '500');
    // Select then deselect Food, select Transport
    fireEvent.press(screen.getByTestId('listrow-Food'));
    fireEvent.press(screen.getByTestId('listrow-Transport'));
    fireEvent.press(screen.getByTestId('listrow-Food')); // deselect
    pressSubmitButton();

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        request: expect.objectContaining({
          categories: ['cat-2'],
        }),
      });
    });
  });

  it('navigates back after successful creation', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<CreateBudgetScreen />);

    fireEvent.changeText(screen.getByTestId('input-Budget Name'), 'Budget');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '500');
    fireEvent.press(screen.getByTestId('listrow-Food'));
    pressSubmitButton();

    await waitFor(() => {
      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  it('shows error on mutation failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('fail'));
    render(<CreateBudgetScreen />);

    fireEvent.changeText(screen.getByTestId('input-Budget Name'), 'Budget');
    fireEvent.changeText(screen.getByTestId('input-Amount'), '500');
    fireEvent.press(screen.getByTestId('listrow-Food'));
    pressSubmitButton();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to create budget. Please try again.',
      );
    });
  });

  it('navigates back when Cancel is pressed', () => {
    render(<CreateBudgetScreen />);
    fireEvent.press(screen.getByText('Cancel'));
    expect(mockRouterBack).toHaveBeenCalled();
  });
});
