import { useAuth } from '@guallet/auth';
import { Button } from '@luna-ui/react-native';
import { Redirect, useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Screen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
        <ActivityIndicator />
        <Text>Don&apos;t close the app</Text>
      </View>
    );
  }

  if (isAuthenticated === false) {
    return <Redirect href="/login" />;
  } else {
    return (
      <View>
        <Button onClick={() => router.replace('/login')}>
          Go back to login screen
        </Button>
      </View>
    );
  }
}
