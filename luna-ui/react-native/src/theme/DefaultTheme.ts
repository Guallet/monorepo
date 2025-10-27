import { LunaTheme } from "./Theme";

export const defaultTheme: LunaTheme = {
  colors: {
    primary: "#005EB8",
    secondary: "#41B6E6",
    text: "#000000",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    darkAccent: "#003087",
    brightAccent: "#0072CE",
    lightAccent: "#41B6E6",
    aquaAccent: "#00A9CE",
    darkSupport: "#006747",
    support: "#009639",
    lightSupport: "#78BE20",
    aquaSupport: "#00A499",
    error: "#DA291C",
    success: "#78BE20",
    warning: "#FAE100",
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  typography: {
    fontFamily: "System",
    fontFamilyMono: "Courier New",
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
  },
};
