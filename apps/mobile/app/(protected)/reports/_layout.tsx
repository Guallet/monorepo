import { Stack } from 'expo-router';
import { useNavigationScreenOptions } from '@/hooks/navigation-screen-options';

export default function ReportsLayout() {
  const screenOptions = useNavigationScreenOptions();
  return <Stack screenOptions={screenOptions} />;
}
