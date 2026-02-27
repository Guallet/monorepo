import React from 'react';
import { render, screen } from '@testing-library/react-native';

const mockConnection = {
  id: 'conn-1',
  institution_id: 'bank-abc',
  created: '2025-06-15T10:30:00Z',
  status: 'active',
};

const mockAccounts = [
  {
    id: 'ob-acc-1',
    details: { name: 'Current Account', currency: 'GBP' },
    metadata: { owner_name: 'John Doe' },
  },
  {
    id: 'ob-acc-2',
    details: { name: null, currency: 'EUR' },
    metadata: { owner_name: 'Jane Doe' },
  },
];

let mockConnectionData: typeof mockConnection | null = mockConnection;
let mockIsLoading = false;
let mockAccountsData = mockAccounts;
let mockAccountsLoading = false;

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
  useOpenBankingConnection: () => ({
    connection: mockConnectionData,
    isLoading: mockIsLoading,
  }),
  useOpenBankingAccountsForConnection: () => ({
    accounts: mockAccountsData,
    isLoading: mockAccountsLoading,
  }),
}));

jest.mock('@luna-ui/react-native', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Section: ({ title, children }: any) => (
      <View testID={`section-${title}`}>
        <Text>{title}</Text>
        {children}
      </View>
    ),
    ListRow: ({ title, subtitle, value }: any) => (
      <View testID={`listrow-${title}`}>
        <Text>{title}</Text>
        {subtitle && <Text>{subtitle}</Text>}
        {value && <Text>{value}</Text>}
      </View>
    ),
    EmptyState: ({ title, message }: any) => (
      <View testID="empty-state">
        <Text>{title}</Text>
        <Text>{message}</Text>
      </View>
    ),
    useTheme: () => ({
      colors: { text: '#000' },
      spacing: { md: 16 },
    }),
  };
});

import { ConnectionDetailScreen } from '@/features/connections/screens/ConnectionDetailScreen';

describe('ConnectionDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectionData = mockConnection;
    mockIsLoading = false;
    mockAccountsData = mockAccounts;
    mockAccountsLoading = false;
  });

  it('renders the screen with correct title', () => {
    render(<ConnectionDetailScreen connectionId="conn-1" />);
    expect(screen.getByText('Connection Details')).toBeTruthy();
  });

  it('displays connection info', () => {
    render(<ConnectionDetailScreen connectionId="conn-1" />);
    expect(screen.getByText('Connection Info')).toBeTruthy();
    expect(screen.getByText('bank-abc')).toBeTruthy();
    expect(screen.getByText('active')).toBeTruthy();
  });

  it('displays linked accounts section', () => {
    render(<ConnectionDetailScreen connectionId="conn-1" />);
    expect(screen.getByText('Linked Accounts')).toBeTruthy();
    expect(screen.getByText('Current Account')).toBeTruthy();
  });

  it('falls back to owner_name when account name is null', () => {
    render(<ConnectionDetailScreen connectionId="conn-1" />);
    expect(screen.getByText('Jane Doe')).toBeTruthy();
  });

  it('shows empty state when connection not found', () => {
    mockConnectionData = null;
    render(<ConnectionDetailScreen connectionId="conn-404" />);
    expect(screen.getByTestId('empty-state')).toBeTruthy();
    expect(screen.getByText('Connection not found')).toBeTruthy();
  });

  it('shows "No accounts linked" when no accounts', () => {
    mockAccountsData = [];
    render(<ConnectionDetailScreen connectionId="conn-1" />);
    expect(screen.getByText('No accounts linked to this connection.')).toBeTruthy();
  });

  it('shows loading message while accounts are loading', () => {
    mockAccountsLoading = true;
    render(<ConnectionDetailScreen connectionId="conn-1" />);
    expect(screen.getByText('Loading accounts...')).toBeTruthy();
  });
});
