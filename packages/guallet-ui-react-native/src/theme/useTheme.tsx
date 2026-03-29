import { useContext } from "react";
import { GualletTheme } from "@guallet/theme";
import { ThemeContext } from "./ThemeProvider";

export function useTheme(): GualletTheme {
  return useContext(ThemeContext);
}
