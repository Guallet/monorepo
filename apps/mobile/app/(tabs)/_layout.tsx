import { Redirect, Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@guallet/auth';
import { useTheme } from '@guallet/luna-mobile';

export default function TabLayout() {
  const { colors } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!isAuthenticated) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBar.tint,
        tabBarInactiveTintColor: colors.tabBar.inactiveTint,
        tabBarStyle: {
          backgroundColor: colors.tabBar.background,
          borderTopColor: colors.tabBar.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="wallet.pass.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.pie.fill" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
