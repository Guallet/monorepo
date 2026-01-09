import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/MobileAuthProvider';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Button
        title="Sign out"
        onPress={() => {
          signOut();
        }}
      />
      <Button title="Test sentry" onPress={() => { throw new Error('Hello, again, Sentry!'); }} />
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
