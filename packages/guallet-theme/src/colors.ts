export type TabBarColors = {
  tint: string;
  inactiveTint: string;
  background: string;
  border: string;
};

export type Colors = {
  // Brand
  primary: string;
  secondary: string;

  // Semantic
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  pageBackground: string;
  border: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  disabled: string;
  disabledText: string;
  primarySubtle: string;
  errorBackground: string;
  overlay: string;
  onPrimary: string;
  onPrimaryMuted: string;
  tabBar: TabBarColors;

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
  textSecondary: '#768692',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  pageBackground: '#F7FAFC',
  border: '#E8EDEE',
  inputBackground: '#F0F9FF',
  inputBorder: '#E5E7EB',
  placeholder: '#6B7280',
  disabled: '#F3F4F6',
  disabledText: '#9CA3AF',
  primarySubtle: '#E1F0FF',
  errorBackground: '#FEF2F2',
  overlay: 'rgba(100, 100, 100, 0.6)',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255, 255, 255, 0.8)',
  tabBar: {
    tint: '#005EB8',
    inactiveTint: '#768692',
    background: '#FFFFFF',
    border: '#E8EDEE',
  },

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

/** The default dark appearance for React Native consumers. */
export const defaultDarkColors: Colors = {
  primary: '#41B6E6',
  secondary: '#00A9CE',

  text: '#F4F7F8',
  textSecondary: '#B5C0C7',
  background: '#121820',
  surface: '#1C252D',
  pageBackground: '#0D1319',
  border: '#425563',
  inputBackground: '#1C252D',
  inputBorder: '#425563',
  placeholder: '#9BA1A6',
  disabled: '#2C3740',
  disabledText: '#9BA1A6',
  primarySubtle: '#163C52',
  errorBackground: '#4A211F',
  overlay: 'rgba(0, 0, 0, 0.6)',
  onPrimary: '#07141C',
  onPrimaryMuted: 'rgba(7, 20, 28, 0.75)',
  tabBar: {
    tint: '#41B6E6',
    inactiveTint: '#9BA1A6',
    background: '#121820',
    border: '#425563',
  },

  darkAccent: '#003087',
  brightAccent: '#0072CE',
  lightAccent: '#41B6E6',
  aquaAccent: '#00A9CE',

  darkSupport: '#006747',
  support: '#78BE20',
  lightSupport: '#78BE20',
  aquaSupport: '#00A499',

  black: '#F4F7F8',
  darkGrey: '#B5C0C7',
  midGrey: '#9BA1A6',
  paleGrey: '#2C3740',
  white: '#FFFFFF',

  error: '#FF8178',
  success: '#A6D65B',
  warning: '#FAE100',
};
