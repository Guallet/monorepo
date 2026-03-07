import { useState, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useOpenBankingConnections } from '@guallet/api-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ListRow } from '@luna-ui/react-native';
import { useRouter } from 'expo-router';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ConnectionsListScreen() {
  const { connections, isLoading, refetch } = useOpenBankingConnections();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen headerTitle="Connections" isLoading={isLoading && !refreshing}>
        {connections.length === 0 && !isLoading ? (
          <EmptyState
            title="No connections yet"
            message="Connect your bank accounts to automatically import transactions."
          />
        ) : (
          <FlatList
            data={connections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListRow
                title={item.institution_id ?? 'Connected Institution'}
                subtitle={`Created: ${formatDate(item.created)}`}
                onPress={() => router.push(`/connection/${item.id}`)}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
