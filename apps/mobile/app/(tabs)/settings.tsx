import { Button, Text, View } from 'react-native';
import { useAuth } from '@/auth/useAuth';
import { AppSection } from '@luna-ui/react-native';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    // <SafeAreaView>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <AppSection title="App Settings">
        <Text>Settings content goes here.</Text>
      </AppSection>
      <Button title="Sign Out" onPress={signOut} />
    </View>
    // </SafeAreaView>
  );
}
