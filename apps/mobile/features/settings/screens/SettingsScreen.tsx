import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useAuth } from '@/auth/useAuth';
import { useUser, useUserSettings } from '@guallet/api-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Label, Title, useTheme } from '@luna-ui/react-native';
import { useRouter, type Href } from 'expo-router';

function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.settingsLabel, { color: colors.text }]}>
        {label}
      </Text>
      {value && <Label size="sm">{value}</Label>}
    </TouchableOpacity>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

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
            <SettingsSection title="Account">
              <SettingsRow label="Name" value={user.name} />
              <SettingsRow label="Email" value={user.email} />
            </SettingsSection>
          )}

          <SettingsSection title="Preferences">
            <SettingsRow
              label="Default Currency"
              value={settings?.currencies?.default_currency ?? 'Not set'}
            />
            <SettingsRow
              label="Date Format"
              value={settings?.date_format ?? 'Not set'}
            />
          </SettingsSection>

          <SettingsSection title="Data">
            <SettingsRow
              label="Categories"
              onPress={() => router.push('/(tabs)/categories' as Href)}
            />
          </SettingsSection>

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
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  settingsLabel: {
    fontSize: 16,
  },
});
