export const FontStyles = {
  primary: "#005EB8",
  secondary: "#41B6E6",
  lightText: "#FFFFFF",
  darkText: "#000000",
} as const;

export const AppFontSizes = {
  extraSmall: 8.0,
  small: 10.0,
  normal: 14.0,
  large: 18.0,
  extraLarge: 24.0,
} as const;

export type AppFontFamily = "Lato" | "Comic Sans";
export type AppFontStyle = "Title" | "Subtitle" | "Caption" | "Body";

// const AppFontWeight = {
//   thin: FontWeight.w100,
//   extraLight: FontWeight.w200,
//   light: FontWeight.w300,
//   regular: FontWeight.w400,
//   medium: FontWeight.w500,
//   semiBold: FontWeight.w600,
//   bold: FontWeight.w700,
//   extraBold: FontWeight.w800,
//   black: FontWeight.w900,
// } as const;
