import { useAuth } from '@guallet/auth';
import { StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from '@guallet/ui-react-native';

export default function SettingsScreen() {
  const { colors, typography } = useTheme();
  const { logout } = useAuth();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface.background.page },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.text.primary, fontSize: typography.sizes.lg },
        ]}
      >
        Settings
      </Text>
      <Button
        onClick={async () => {
          await logout();
        }}
      >
        Sign out
      </Button>
      <Button
        onClick={() => {
          throw new Error('Hello, again, Sentry!');
        }}
      >
        Test sentry
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
