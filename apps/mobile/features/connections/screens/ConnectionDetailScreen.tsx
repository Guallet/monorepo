import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import {
  useOpenBankingConnection,
  useOpenBankingAccountsForConnection,
} from '@guallet/api-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EmptyState,
  ListRow,
  Section,
  useTheme,
} from '@luna-ui/react-native';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface ConnectionDetailScreenProps {
  connectionId: string;
}

export function ConnectionDetailScreen({
  connectionId,
}: ConnectionDetailScreenProps) {
  const { connection, isLoading } = useOpenBankingConnection(connectionId);
  const { accounts, isLoading: accountsLoading } =
    useOpenBankingAccountsForConnection(connectionId);
  const { spacing } = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen
        headerTitle="Connection Details"
        isLoading={isLoading}
      >
        {!connection && !isLoading ? (
          <EmptyState
            title="Connection not found"
            message="This connection could not be loaded."
          />
        ) : connection ? (
          <View style={{ padding: spacing.md, gap: 24 }}>
            <Section title="Connection Info">
              <ListRow
                title="Institution"
                value={connection.institution_id ?? 'Unknown'}
              />
              <ListRow
                title="Created"
                value={formatDate(connection.created)}
              />
              <ListRow
                title="Status"
                value={connection.status ?? 'Unknown'}
              />
            </Section>

            <Section title="Linked Accounts">
              {accountsLoading ? (
                <View style={styles.loadingHint}>
                  <Text style={styles.hintText}>Loading accounts...</Text>
                </View>
              ) : accounts.length === 0 ? (
                <View style={styles.loadingHint}>
                  <Text style={styles.hintText}>
                    No accounts linked to this connection.
                  </Text>
                </View>
              ) : (
                accounts.map((account) => (
                  <ListRow
                    key={account.id}
                    title={account.details?.name ?? account.metadata?.owner_name ?? 'Account'}
                    subtitle={account.details?.currency ?? ''}
                  />
                ))
              )}
            </Section>
          </View>
        ) : null}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingHint: {
    padding: 16,
  },
  hintText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
