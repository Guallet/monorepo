import { createContext } from 'react';
import { GualletTheme } from '@guallet/theme';
import { DefaultTheme } from './DefaultTheme';

export const GualletThemeContext = createContext<GualletTheme>(DefaultTheme);
