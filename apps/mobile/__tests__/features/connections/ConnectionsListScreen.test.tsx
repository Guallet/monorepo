import React from 'react';
import { render, screen } from '@testing-library/react-native';

const mockConnections = [
  {
    id: 'conn-1',
    institution_id: 'bank-abc',
    created: '2025-06-15T10:30:00Z',
    status: 'active',
  },
  {
    id: 'conn-2',
    institution_id: null,
    created: null,
    status: 'expired',
  },
];

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, back: jest.fn() }),
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

let mockConnectionsData = mockConnections;
let mockIsLoading = false;

jest.mock('@guallet/api-react', () => ({
  useOpenBankingConnections: () => ({
    connections: mockConnectionsData,
    isLoading: mockIsLoading,
    refetch: jest.fn(),
  }),
}));

jest.mock('@luna-ui/react-native', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    ListRow: ({ title, subtitle, onPress }: any) => (
      <TouchableOpacity onPress={onPress} testID={`listrow-${title}`}>
        <Text>{title}</Text>
        {subtitle && <Text>{subtitle}</Text>}
      </TouchableOpacity>
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

import { ConnectionsListScreen } from '@/features/connections/screens/ConnectionsListScreen';

describe('ConnectionsListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectionsData = mockConnections;
    mockIsLoading = false;
  });

  it('renders the screen with correct title', () => {
    render(<ConnectionsListScreen />);
    expect(screen.getByText('Connections')).toBeTruthy();
  });

  it('renders connections list', () => {
    render(<ConnectionsListScreen />);
    expect(screen.getByText('bank-abc')).toBeTruthy();
  });

  it('displays "Connected Institution" for connections without institution_id', () => {
    render(<ConnectionsListScreen />);
    expect(screen.getByText('Connected Institution')).toBeTruthy();
  });

  it('formats dates correctly', () => {
    render(<ConnectionsListScreen />);
    // The first connection has a valid date
    const dateElements = screen.getAllByText(/Created:/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('displays "Unknown" for null dates', () => {
    render(<ConnectionsListScreen />);
    expect(screen.getByText('Created: Unknown')).toBeTruthy();
  });

  it('shows empty state when no connections', () => {
    mockConnectionsData = [];
    render(<ConnectionsListScreen />);
    expect(screen.getByTestId('empty-state')).toBeTruthy();
    expect(screen.getByText('No connections yet')).toBeTruthy();
  });
});
