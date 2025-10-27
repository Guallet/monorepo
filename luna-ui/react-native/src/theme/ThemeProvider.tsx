import { createContext, PropsWithChildren } from "react";
import { LunaTheme } from "./Theme";
import { defaultTheme } from "./DefaultTheme";

export const ThemeContext = createContext<LunaTheme>(defaultTheme);

export function LunaProvider({
  children,
  theme,
}: PropsWithChildren<{ theme?: LunaTheme }>) {
  return (
    <ThemeContext.Provider value={theme || defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
}
