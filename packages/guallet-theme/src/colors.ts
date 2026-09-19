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

export type ButtonInteractionColors = {
  default: string;
  hover: string;
  pressed: string;
  focus: string;
  selected: string;
  disabled: string;
};

export type ButtonColors = {
  primary: ButtonInteractionColors;
  secondary: ButtonInteractionColors;
  disabled: ButtonInteractionColors;
  outline: ButtonInteractionColors;
  subtle: ButtonInteractionColors;
  transparent: ButtonInteractionColors;
  onPrimary: ButtonInteractionColors;
  onPrimaryMuted: ButtonInteractionColors;
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
    disabled: '#4B5563',
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
    primary: {
      default: '#005EB8',
      hover: '#003087',
      pressed: '#003087',
      focus: '#0072CE',
      selected: '#003087',
      disabled: '#F3F4F6',
    },
    secondary: {
      default: '#E1F0FF',
      hover: '#C7E3FF',
      pressed: '#B0D9FF',
      focus: '#C7E3FF',
      selected: '#C7E3FF',
      disabled: '#F3F4F6',
    },
    disabled: {
      default: '#F3F4F6',
      hover: '#E5E7EB',
      pressed: '#D1D5DB',
      focus: '#005EB8',
      selected: '#E5E7EB',
      disabled: '#F3F4F6',
    },
    outline: {
      default: '#005EB8',
      hover: '#003087',
      pressed: '#003087',
      focus: '#0072CE',
      selected: '#003087',
      disabled: '#6B7280',
    },
    subtle: {
      default: '#F5F5F5',
      hover: '#E5E7EB',
      pressed: '#D1D5DB',
      focus: '#E5E7EB',
      selected: '#E5E7EB',
      disabled: '#F3F4F6',
    },
    transparent: {
      default: 'transparent',
      hover: '#F5F5F5',
      pressed: '#E5E7EB',
      focus: '#F5F5F5',
      selected: '#F5F5F5',
      disabled: 'transparent',
    },
    onPrimary: {
      default: '#FFFFFF',
      hover: '#FFFFFF',
      pressed: '#FFFFFF',
      focus: '#FFFFFF',
      selected: '#FFFFFF',
      disabled: '#4B5563',
    },
    onPrimaryMuted: {
      default: 'rgba(255, 255, 255, 0.8)',
      hover: 'rgba(255, 255, 255, 0.9)',
      pressed: 'rgba(255, 255, 255, 0.95)',
      focus: 'rgba(255, 255, 255, 0.9)',
      selected: 'rgba(255, 255, 255, 0.9)',
      disabled: 'rgba(75, 85, 99, 0.8)',
    },
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
    disabled: '#B5C0C7',
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
    primary: {
      default: '#41B6E6',
      hover: '#00A9CE',
      pressed: '#0072CE',
      focus: '#41B6E6',
      selected: '#00A9CE',
      disabled: '#2C3740',
    },
    secondary: {
      default: '#163C52',
      hover: '#1B4B63',
      pressed: '#245E79',
      focus: '#1B4B63',
      selected: '#1B4B63',
      disabled: '#2C3740',
    },
    disabled: {
      default: '#2C3740',
      hover: '#425563',
      pressed: '#425563',
      focus: '#41B6E6',
      selected: '#425563',
      disabled: '#2C3740',
    },
    outline: {
      default: '#41B6E6',
      hover: '#00A9CE',
      pressed: '#0072CE',
      focus: '#41B6E6',
      selected: '#00A9CE',
      disabled: '#B5C0C7',
    },
    subtle: {
      default: '#1C252D',
      hover: '#2C3740',
      pressed: '#425563',
      focus: '#2C3740',
      selected: '#2C3740',
      disabled: '#2C3740',
    },
    transparent: {
      default: 'transparent',
      hover: '#1C252D',
      pressed: '#2C3740',
      focus: '#1C252D',
      selected: '#1C252D',
      disabled: 'transparent',
    },
    onPrimary: {
      default: '#07141C',
      hover: '#07141C',
      pressed: '#07141C',
      focus: '#07141C',
      selected: '#07141C',
      disabled: '#B5C0C7',
    },
    onPrimaryMuted: {
      default: 'rgba(7, 20, 28, 0.75)',
      hover: 'rgba(7, 20, 28, 0.85)',
      pressed: 'rgba(7, 20, 28, 0.9)',
      focus: 'rgba(7, 20, 28, 0.85)',
      selected: 'rgba(7, 20, 28, 0.85)',
      disabled: 'rgba(181, 192, 199, 0.8)',
    },
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
