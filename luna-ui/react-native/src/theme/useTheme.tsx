import React, {
  createContext,
  useContext,
  useMemo,
  PropsWithChildren,
} from "react";

export type Colors = {
  primary: string;
  primaryContrast: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
};

export type Spacing = {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type Typography = {
  fontFamily: string;
  fontFamilyMono: string;
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  weights: {
    regular: "400" | "normal" | number;
    medium: "500" | number;
    semibold: "600" | number;
    bold: "700" | "bold" | number;
  };
};

export type Theme = {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
};

export const defaultTheme: Theme = {
  colors: {
    primary: "#4F46E5",
    primaryContrast: "#FFFFFF",
    background: "#FFFFFF",
    surface: "#F4F4F5",
    text: "#111827",
    mutedText: "#6B7280",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    border: "#E5E7EB",
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  typography: {
    fontFamily: "System",
    fontFamilyMono: "Menlo",
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
    lineHeights: {
      tight: 1.1,
      normal: 1.35,
      relaxed: 1.6,
    },
    weights: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ThemeOverrides = DeepPartial<Theme>;

const ThemeContext = createContext<Theme>(defaultTheme);

function mergeDeep<T extends object>(base: T, override?: DeepPartial<T>): T {
  if (!override) return base;
  const result: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const key in override) {
    const baseVal = (base as any)[key];
    const overVal = (override as any)[key];
    if (overVal === undefined) continue;
    if (
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      typeof overVal === "object" &&
      !Array.isArray(overVal)
    ) {
      result[key] = mergeDeep(baseVal, overVal as any);
    } else {
      result[key] = overVal;
    }
  }
  return result;
}

export function LunaUiThemeProvider({
  children,
  overrides,
}: PropsWithChildren<{ overrides?: ThemeOverrides }>) {
  const value = useMemo(() => mergeDeep(defaultTheme, overrides), [overrides]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Pick<Theme, "colors" | "spacing" | "typography"> {
  const { colors, spacing, typography } = useContext(ThemeContext);
  return { colors, spacing, typography };
}
