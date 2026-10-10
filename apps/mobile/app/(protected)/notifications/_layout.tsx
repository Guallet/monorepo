import { Stack } from 'expo-router';
import { useNavigationScreenOptions } from '@/hooks/navigation-screen-options';
export const unstable_settings = { anchor: 'index' };

export default function NotificationsLayout() {
  const screenOptions = useNavigationScreenOptions();
  return <Stack screenOptions={screenOptions} />;
}
