export type TabBarColors = {
  tint: string;
  inactiveTint: string;
  background: string;
  border: string;
};

export type TextColors = {
  primary: string;
  secondary: string;
  disabled: string;
  placeholder: string;
  inverse: string;
};

export type SurfaceBackgroundColors = {
  primary: string;
  secondary: string;
  page: string;
  input: string;
  error: string;
  disabled: string;
};

export type SurfaceBorderColors = {
  primary: string;
  input: string;
  disabled: string;
};

export type SurfaceColors = {
  background: SurfaceBackgroundColors;
  border: SurfaceBorderColors;
  overlay: string;
};

export type ButtonColors = {
  primary: string;
  secondary: string;
  disabled: string;
  outline: string;
  subtle: string;
  transparent: string;
  onPrimary: string;
  onPrimaryMuted: string;
};

export type AccentColors = {
  primary: string;
  secondary: string;
  dark: string;
  bright: string;
  light: string;
  aqua: string;
};

export type SupportColors = {
  primary: string;
  dark: string;
  light: string;
  aqua: string;
};

export type NeutralColors = {
  black: string;
  darkGrey: string;
  midGrey: string;
  paleGrey: string;
  white: string;
};

export type StatusColors = {
  error: string;
  success: string;
  warning: string;
};

export type Colors = {
  text: TextColors;
  surface: SurfaceColors;
  button: ButtonColors;
  accent: AccentColors;
  support: SupportColors;
  neutral: NeutralColors;
  status: StatusColors;
  tabBar: TabBarColors;
};

export const defaultColors: Colors = {
  text: {
    primary: '#000000',
    secondary: '#768692',
    disabled: '#9CA3AF',
    placeholder: '#6B7280',
    inverse: '#FFFFFF',
  },
  surface: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      page: '#F7FAFC',
      input: '#F0F9FF',
      error: '#FEF2F2',
      disabled: '#F3F4F6',
    },
    border: {
      primary: '#E8EDEE',
      input: '#E5E7EB',
      disabled: '#F3F4F6',
    },
    overlay: 'rgba(100, 100, 100, 0.6)',
  },
  button: {
    primary: '#005EB8',
    secondary: '#E1F0FF',
    disabled: '#F3F4F6',
    outline: '#005EB8',
    subtle: '#F5F5F5',
    transparent: 'transparent',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: 'rgba(255, 255, 255, 0.8)',
  },
  accent: {
    primary: '#005EB8',
    secondary: '#41B6E6',
    dark: '#003087',
    bright: '#0072CE',
    light: '#41B6E6',
    aqua: '#00A9CE',
  },
  support: {
    primary: '#009639',
    dark: '#006747',
    light: '#78BE20',
    aqua: '#00A499',
  },
  neutral: {
    black: '#231F20',
    darkGrey: '#425563',
    midGrey: '#768692',
    paleGrey: '#E8EDEE',
    white: '#FFFFFF',
  },
  status: {
    error: '#DA291C',
    success: '#78BE20',
    warning: '#FAE100',
  },
  tabBar: {
    tint: '#005EB8',
    inactiveTint: '#768692',
    background: '#FFFFFF',
    border: '#E8EDEE',
  },
};

/** The default dark appearance for React Native consumers. */
export const defaultDarkColors: Colors = {
  ...defaultColors,
  text: {
    ...defaultColors.text,
    primary: '#F4F7F8',
    secondary: '#B5C0C7',
    disabled: '#9BA1A6',
    placeholder: '#9BA1A6',
    inverse: '#07141C',
  },
  surface: {
    ...defaultColors.surface,
    background: {
      ...defaultColors.surface.background,
      primary: '#121820',
      secondary: '#1C252D',
      page: '#0D1319',
      input: '#1C252D',
      error: '#4A211F',
      disabled: '#2C3740',
    },
    border: {
      ...defaultColors.surface.border,
      primary: '#425563',
      input: '#425563',
      disabled: '#2C3740',
    },
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  button: {
    ...defaultColors.button,
    primary: '#41B6E6',
    secondary: '#163C52',
    disabled: '#2C3740',
    outline: '#41B6E6',
    subtle: '#1C252D',
    onPrimary: '#07141C',
    onPrimaryMuted: 'rgba(7, 20, 28, 0.75)',
  },
  accent: {
    ...defaultColors.accent,
    primary: '#41B6E6',
    secondary: '#00A9CE',
  },
  support: {
    ...defaultColors.support,
    primary: '#78BE20',
  },
  neutral: {
    ...defaultColors.neutral,
    black: '#F4F7F8',
    darkGrey: '#B5C0C7',
    midGrey: '#9BA1A6',
    paleGrey: '#2C3740',
  },
  status: {
    ...defaultColors.status,
    error: '#FF8178',
    success: '#A6D65B',
  },
  tabBar: {
    tint: '#41B6E6',
    inactiveTint: '#9BA1A6',
    background: '#121820',
    border: '#425563',
  },
};
