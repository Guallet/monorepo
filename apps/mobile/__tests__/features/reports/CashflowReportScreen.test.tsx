import React from 'react';
import { render, screen } from '@testing-library/react-native';

const mockCashflowData = {
  year: 2025,
  totalTransactions: 150,
  data: [
    {
      categoryId: 'cat-1',
      categoryName: 'Food',
      isParent: true,
      totalTransactions: 50,
      values: ['-100.50', '-200.25', '-50.00'],
      subcategories: [],
    },
    {
      categoryId: 'cat-2',
      categoryName: 'Income',
      isParent: true,
      totalTransactions: 30,
      values: ['3000', '3000', '3000'],
      subcategories: [],
    },
    {
      categoryId: null,
      categoryName: 'Uncategorised',
      isParent: false,
      totalTransactions: 10,
      values: ['-20', '15'],
      subcategories: [],
    },
  ],
};

let mockData: typeof mockCashflowData | undefined = mockCashflowData;
let mockIsLoading = false;

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  Stack: { Screen: () => null },
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('@/components/layout/AppScreen', () => {
  const { View, Text } = require('react-native');
  return {
    AppScreen: ({ children, headerTitle, isLoading }: any) => (
      <View>
        <Text>{headerTitle}</Text>
        {isLoading && <Text testID="loading">Loading</Text>}
        {children}
      </View>
    ),
  };
});

jest.mock('@guallet/api-react', () => ({
  useCashflowReports: () => ({
    cashflowData: mockData,
    isLoading: mockIsLoading,
  }),
}));

jest.mock('@guallet/money', () => ({
  Money: {
    fromCurrencyCode: ({ amount, currencyCode }: any) => ({
      format: () => `£${Math.abs(amount).toFixed(2)}`,
    }),
  },
}));

jest.mock('@luna-ui/react-native', () => {
  const { View, Text } = require('react-native');
  return {
    Card: ({ children, style }: any) => <View testID="card">{children}</View>,
    EmptyState: ({ title, message }: any) => (
      <View testID="empty-state">
        <Text>{title}</Text>
        <Text>{message}</Text>
      </View>
    ),
    Label: ({ children }: any) => <Text>{children}</Text>,
    Section: ({ title, children }: any) => (
      <View><Text>{title}</Text>{children}</View>
    ),
    useTheme: () => ({
      colors: { text: '#000' },
      spacing: { md: 16 },
    }),
  };
});

import { CashflowReportScreen } from '@/features/reports/screens/CashflowReportScreen';

describe('CashflowReportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockData = mockCashflowData;
    mockIsLoading = false;
  });

  it('renders the screen with correct title', () => {
    render(<CashflowReportScreen />);
    expect(screen.getByText('Cashflow Report')).toBeTruthy();
  });

  it('renders year and transaction count header', () => {
    render(<CashflowReportScreen />);
    expect(screen.getByText(/Year 2025/)).toBeTruthy();
    expect(screen.getByText('150 transactions')).toBeTruthy();
  });

  it('renders category rows', () => {
    render(<CashflowReportScreen />);
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Income')).toBeTruthy();
    expect(screen.getByText('Uncategorised')).toBeTruthy();
  });

  it('renders transaction counts per category', () => {
    render(<CashflowReportScreen />);
    expect(screen.getByText('50 txns')).toBeTruthy();
    expect(screen.getByText('30 txns')).toBeTruthy();
    expect(screen.getByText('10 txns')).toBeTruthy();
  });

  it('shows empty state when no data', () => {
    mockData = undefined;
    render(<CashflowReportScreen />);
    expect(screen.getByTestId('empty-state')).toBeTruthy();
    expect(screen.getByText('No data available')).toBeTruthy();
  });
});
