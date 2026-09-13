import { useAuth } from '@guallet/auth';
import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Screen() {
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
  }

  return <Redirect href="/(tabs)" />;
}
