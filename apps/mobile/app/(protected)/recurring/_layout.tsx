import { Stack } from 'expo-router';
import { useNavigationScreenOptions } from '@/hooks/navigation-screen-options';

export default function RecurringLayout() {
  const screenOptions = useNavigationScreenOptions();
  return <Stack screenOptions={screenOptions} />;
}
