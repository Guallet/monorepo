import type { GualletTheme } from '@guallet/theme';

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    light: GualletTheme;
    dark: GualletTheme;
  }
}
