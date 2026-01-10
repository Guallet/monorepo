import { useAuth } from '@guallet/auth';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Button
        title="Sign out"
        onPress={async () => {
          await logout();
        }}
      />
      <Button
        title="Test sentry"
        onPress={() => {
          throw new Error('Hello, again, Sentry!');
        }}
      />
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
