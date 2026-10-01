import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@guallet/auth';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';

export default function SavingGoalsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();
  if (isLoading)
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: colors.surface.background.page },
        ]}
      >
        <ActivityIndicator
          accessibilityLabel="Loading saving goals"
          color={colors.accent.primary}
        />
      </View>
    );
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
