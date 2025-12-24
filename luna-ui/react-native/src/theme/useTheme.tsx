import { useContext } from "react";
import { LunaTheme } from "./Theme";
import { ThemeContext } from "./ThemeProvider";

export function useTheme(): LunaTheme {
  const theme = useContext(ThemeContext);
  return theme;
}
