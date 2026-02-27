import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useAuth } from '@/auth/useAuth';
import { useUser, useUserSettings } from '@guallet/api-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  ListRow,
  Section,
  useTheme,
} from '@luna-ui/react-native';
import { useRouter, type Href } from 'expo-router';

export function SettingsScreen() {
  const { logout } = useAuth();
  const { user, isLoading: userLoading } = useUser();
  const { settings, isLoading: settingsLoading } = useUserSettings();
  const router = useRouter();
  const { spacing } = useTheme();

  const isLoading = userLoading || settingsLoading;

  return (
    <SafeAreaView style={styles.container}>
      <AppScreen headerTitle="Settings" isLoading={isLoading}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, gap: 24 }}>
          {user && (
            <Section title="Account">
              <ListRow title="Name" value={user.name} />
              <ListRow title="Email" value={user.email} />
            </Section>
          )}

          <Section title="Preferences">
            <ListRow
              title="Default Currency"
              value={settings?.currencies?.default_currency ?? 'Not set'}
            />
            <ListRow
              title="Date Format"
              value={settings?.date_format ?? 'Not set'}
            />
          </Section>

          <Section title="Data">
            <ListRow
              title="Categories"
              onPress={() => router.push('/(tabs)/categories' as Href)}
            />
            <ListRow
              title="Saving Goals"
              onPress={() => router.push('/(tabs)/saving-goals' as Href)}
            />
            <ListRow
              title="Subscriptions"
              onPress={() => router.push('/(tabs)/subscriptions' as Href)}
            />
            <ListRow
              title="Notifications"
              onPress={() => router.push('/(tabs)/notifications' as Href)}
            />
          </Section>

          <View style={{ gap: 12, marginTop: 8 }}>
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
              }}
            >
              Sign out
            </Button>
          </View>
        </ScrollView>
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
