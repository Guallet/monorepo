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
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
};

export const defaultTypography: Typography = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontFamilyMono: "ui-monospace, monospace",
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};
