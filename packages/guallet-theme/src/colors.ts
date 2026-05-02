export type Colors = {
  // Brand
  primary: string;
  secondary: string;

  // Semantic
  text: string;
  background: string;
  surface: string;
  pageBackground: string;

  // Main Accent Colors
  darkAccent: string;
  brightAccent: string;
  lightAccent: string;
  aquaAccent: string;

  // Supporting Colors
  darkSupport: string;
  support: string;
  lightSupport: string;
  aquaSupport: string;

  // Neutral Colors
  black: string;
  darkGrey: string;
  midGrey: string;
  paleGrey: string;
  white: string;

  // Alert Colors
  error: string;
  success: string;
  warning: string;
};

export const defaultColors: Colors = {
  primary: '#005EB8',
  secondary: '#41B6E6',

  text: '#000000',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  pageBackground: '#F7FAFC',

  darkAccent: '#003087',
  brightAccent: '#0072CE',
  lightAccent: '#41B6E6',
  aquaAccent: '#00A9CE',

  darkSupport: '#006747',
  support: '#009639',
  lightSupport: '#78BE20',
  aquaSupport: '#00A499',

  black: '#231F20',
  darkGrey: '#425563',
  midGrey: '#768692',
  paleGrey: '#E8EDEE',
  white: '#FFFFFF',

  error: '#DA291C',
  success: '#78BE20',
  warning: '#FAE100',
};
