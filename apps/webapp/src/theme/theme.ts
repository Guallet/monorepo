import { createTheme, MantineColorsTuple } from '@mantine/core';
import { Colors } from './colors';

// Define custom color tuples following Mantine's color system
// Each tuple contains 10 shades from lightest to darkest
const primaryColor: MantineColorsTuple = [
  '#e5f2ff',
  '#cde1ff',
  '#9bc0ff',
  '#649eff',
  '#3a82fe',
  '#1f72fe',
  '#006bff',
  Colors.primary, // #005EB8
  '#00468a',
  '#002f5c',
];

const secondaryColor: MantineColorsTuple = [
  '#e0f7ff',
  '#c9ebff',
  '#97d7ff',
  '#61c2ff',
  '#36b1ff',
  '#29adff',
  Colors.secondary, // #41B6E6 - using as base at index 6
  '#1fa0d0',
  '#0088b8',
  '#00709a',
];

const successColor: MantineColorsTuple = [
  '#f4fbe8',
  '#e8f5d7',
  '#cde9ab',
  '#b0dd7a',
  '#92d04d',
  '#84c336',
  Colors.success, // #78BE20
  '#6aaf1a',
  '#5a9914',
  '#4a800e',
];

const errorColor: MantineColorsTuple = [
  '#ffe5e5',
  '#ffc9c9',
  '#ff9999',
  '#ff6666',
  '#ff3838',
  '#e62f23',
  Colors.error, // #DA291C
  '#c01f15',
  '#a51a11',
  '#8a140d',
];

const warningColor: MantineColorsTuple = [
  '#fffbe5',
  '#fff8cc',
  '#ffef99',
  '#ffe666',
  '#ffde33',
  '#fceb1a',
  Colors.warning, // #FAE100 - using as base at index 6
  '#e0cc00',
  '#c5b200',
  '#a89600',
];

export const theme = createTheme({
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
    success: successColor,
    error: errorColor,
    warning: warningColor,
  },
  primaryColor: 'primary',
  primaryShade: 6,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  // Other Mantine theme properties can be added here as needed
  other: {
    // Custom color values that don't fit Mantine's color system
    pageBackground: Colors.pageBackground,
    darkAccent: Colors.darkAccent,
    brightAccent: Colors.brightAccent,
    lightAccent: Colors.lightAccent,
    aquaAccent: Colors.aquaAccent,
    darkSupport: Colors.darkSupport,
    support: Colors.support,
    lightSupport: Colors.lightSupport,
    aquaSupport: Colors.aquaSupport,
    black: Colors.black,
    darkGrey: Colors.darkGrey,
    midGrey: Colors.midGrey,
    paleGrey: Colors.paleGrey,
    white: Colors.white,
  },
});
