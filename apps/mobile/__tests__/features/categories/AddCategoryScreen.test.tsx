import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockMutateAsync = jest.fn();
const mockRouterBack = jest.fn();

const mockCategories = [
  { id: 'cat-1', name: 'Food', parentId: null },
  { id: 'cat-2', name: 'Transport', parentId: null },
  { id: 'cat-3', name: 'Fast Food', parentId: 'cat-1' },
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
  useCategoryMutations: () => ({
    createCategoryMutation: { mutateAsync: mockMutateAsync },
  }),
  useCategories: () => ({ categories: mockCategories }),
}));

jest.mock('@luna-ui/react-native', () => {
  const { View, Text, TouchableOpacity, TextInput: RNTextInput } = require('react-native');
  return {
    Button: ({ children, onClick, disabled, style }: any) => (
      <TouchableOpacity onPress={onClick} disabled={disabled} style={style} accessibilityRole="button">
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

import { AddCategoryScreen } from '@/features/categories/screens/AddCategoryScreen';

describe('AddCategoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders the screen with correct title', () => {
    render(<AddCategoryScreen />);
    expect(screen.getByText('Add Category')).toBeTruthy();
  });

  it('renders the category name input', () => {
    render(<AddCategoryScreen />);
    expect(screen.getByText('Category Name')).toBeTruthy();
  });

  it('renders icon section with preset icons', () => {
    render(<AddCategoryScreen />);
    expect(screen.getByText('Icon')).toBeTruthy();
    // Check a few preset icons are rendered
    expect(screen.getByText('🏠')).toBeTruthy();
    expect(screen.getByText('🚗')).toBeTruthy();
    expect(screen.getByText('🍔')).toBeTruthy();
  });

  it('renders colour section', () => {
    render(<AddCategoryScreen />);
    expect(screen.getByText('Colour')).toBeTruthy();
  });

  it('renders parent category section with top-level categories only', () => {
    render(<AddCategoryScreen />);
    expect(screen.getByText('Parent Category (optional)')).toBeTruthy();
    expect(screen.getByText('No parent (top level)')).toBeTruthy();
    // Only top-level categories (no parentId) should appear
    expect(screen.getByTestId('listrow-Food')).toBeTruthy();
    expect(screen.getByTestId('listrow-Transport')).toBeTruthy();
    // Fast Food has parentId so shouldn't appear in parent selection
    expect(screen.queryByTestId('listrow-Fast Food')).toBeNull();
  });

  it('renders action buttons', () => {
    render(<AddCategoryScreen />);
    expect(screen.getByText('Create Category')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('shows validation error when name is empty', async () => {
    render(<AddCategoryScreen />);
    fireEvent.press(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Category name is required.',
      );
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('creates category with default values', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddCategoryScreen />);

    fireEvent.changeText(screen.getByTestId('input-Category Name'), 'Shopping');
    fireEvent.press(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        request: expect.objectContaining({
          name: 'Shopping',
          icon: '📁', // default icon
          colour: '#3B82F6', // default color
          parentId: undefined,
        }),
      });
    });
  });

  it('creates category with selected parent', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddCategoryScreen />);

    fireEvent.changeText(screen.getByTestId('input-Category Name'), 'Takeaway');
    fireEvent.press(screen.getByTestId('listrow-Food'));
    fireEvent.press(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        request: expect.objectContaining({
          name: 'Takeaway',
          parentId: 'cat-1',
        }),
      });
    });
  });

  it('navigates back after successful creation', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AddCategoryScreen />);

    fireEvent.changeText(screen.getByTestId('input-Category Name'), 'Test');
    fireEvent.press(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  it('shows error on mutation failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('fail'));
    render(<AddCategoryScreen />);

    fireEvent.changeText(screen.getByTestId('input-Category Name'), 'Test');
    fireEvent.press(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to create category. Please try again.',
      );
    });
  });

  it('navigates back when Cancel is pressed', () => {
    render(<AddCategoryScreen />);
    fireEvent.press(screen.getByText('Cancel'));
    expect(mockRouterBack).toHaveBeenCalled();
  });
});
