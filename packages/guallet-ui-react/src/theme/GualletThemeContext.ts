import { createContext } from 'react';
import { DefaultTheme, GualletTheme } from '@guallet/theme';

export const GualletThemeContext = createContext<GualletTheme>(DefaultTheme);
