import { useNavigationScreenOptions } from '@/hooks/navigation-screen-options';
import { Stack } from 'expo-router/stack';

export default function LoginLayout() {
  const screenOptions = useNavigationScreenOptions();
  return <Stack screenOptions={screenOptions} />;
}
