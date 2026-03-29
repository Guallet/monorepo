import { createContext, PropsWithChildren } from "react";
import { GualletTheme, DefaultTheme } from "@guallet/theme";

export const ThemeContext = createContext<GualletTheme>(DefaultTheme);

export function LunaProvider({
  children,
  theme,
}: PropsWithChildren<{ theme?: GualletTheme }>) {
  return (
    <ThemeContext.Provider value={theme ?? DefaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
}
