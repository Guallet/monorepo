import { useContext } from 'react';
import { GualletTheme } from '@guallet/theme';
import { GualletThemeContext } from '../theme/GualletThemeContext';

export function useTheme(): GualletTheme {
  return useContext(GualletThemeContext);
}
