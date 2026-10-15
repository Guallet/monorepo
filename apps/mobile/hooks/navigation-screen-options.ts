import { useTheme } from '@guallet/luna-mobile';
import type { NativeStackNavigationOptions } from 'expo-router';

export function useNavigationScreenOptions(): NativeStackNavigationOptions {
  const { colors } = useTheme();
  return {
    contentStyle: { backgroundColor: colors.surface.background.page },
    headerStyle: { backgroundColor: colors.surface.background.primary },
    headerBackButtonDisplayMode: 'minimal',
    headerTintColor: colors.text.primary,
    headerTitleStyle: { color: colors.text.primary },
  };
}
