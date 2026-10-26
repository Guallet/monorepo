import { StyleSheet } from 'react-native-unistyles';
import type { LunaTheme } from '@guallet/luna-mobile';
import {
  DarkTheme,
  DefaultTheme,
} from '../../packages/guallet-luna-mobile/src/theme/DefaultTheme';

const themes: Record<'light' | 'dark', LunaTheme> = {
  light: DefaultTheme,
  dark: DarkTheme,
};

StyleSheet.configure({
  themes,
  settings: {
    initialTheme: 'light',
  },
});
