import { Redirect, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useAuth } from '@guallet/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function TransactionsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
