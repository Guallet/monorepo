export type LunaFontSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

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
