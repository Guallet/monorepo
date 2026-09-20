import { useAuth } from '@guallet/auth';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@guallet/luna-mobile';

export default function Screen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Loading...</ThemedText>
        <ActivityIndicator color={colors.accent.primary} />
        <ThemedText>Don&apos;t close the app</ThemedText>
      </ThemedView>
    );
  }

  if (isAuthenticated === false) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
