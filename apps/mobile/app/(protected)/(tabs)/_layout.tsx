import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@guallet/luna-mobile';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
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
            <IconSymbol
              size={28}
              name="wallet.pass.fill"
              color={String(color)}
            />
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
