import { generateColors } from '@mantine/colors-generator';
import { GualletTheme } from '@guallet/theme';
import {
  createTheme,
  defaultVariantColorsResolver,
  type MantineThemeOverride,
  type MantineTheme,
  type VariantColorsResolver,
} from '@mantine/core';

type ButtonVariant = 'filled' | 'light' | 'outline' | 'subtle' | 'transparent';

function getButtonVariant(
  variant: string | undefined,
): ButtonVariant | undefined {
  if (
    variant === 'filled' ||
    variant === 'light' ||
    variant === 'outline' ||
    variant === 'subtle' ||
    variant === 'transparent'
  ) {
    return variant;
  }

  return undefined;
}

export function createMantineGualletTheme(
  theme: GualletTheme,
): MantineThemeOverride {
  const buttonColors = theme.colors.button;

  const buttonVariantColorResolver: VariantColorsResolver = (input) => {
    const buttonVariant = getButtonVariant(input.variant);

    if (input.color !== 'primary' || !buttonVariant) {
      return defaultVariantColorsResolver(input);
    }

    const variantColors =
      buttonVariant === 'filled'
        ? buttonColors.primary
        : buttonVariant === 'light'
          ? buttonColors.secondary
          : buttonVariant === 'outline'
            ? buttonColors.outline
            : buttonVariant === 'subtle'
              ? buttonColors.subtle
              : buttonColors.transparent;

    const isOutline = buttonVariant === 'outline';
    const isTransparent = buttonVariant === 'transparent';

    return {
      background: isOutline
        ? buttonColors.transparent.default
        : variantColors.default,
      hover: isOutline ? buttonColors.transparent.hover : variantColors.hover,
      color:
        buttonVariant === 'filled'
          ? buttonColors.onPrimary.default
          : buttonColors.outline.default,
      border: isOutline
        ? buttonColors.outline.default
        : isTransparent
          ? 'transparent'
          : variantColors.default,
      hoverColor:
        buttonVariant === 'filled'
          ? buttonColors.onPrimary.hover
          : buttonColors.outline.hover,
    };
  };

  return createTheme({
    primaryColor: 'primary',
    primaryShade: 6,
    variantColorResolver: buttonVariantColorResolver,
    colors: {
      primary: generateColors(theme.colors.accent.primary),
      secondary: generateColors(theme.colors.accent.secondary),
      error: generateColors(theme.colors.status.error),
      success: generateColors(theme.colors.status.success),
      warning: generateColors(theme.colors.status.warning),
    },
    fontFamily: theme.typography.fontFamily,
    fontFamilyMonospace: theme.typography.fontFamilyMono,
    breakpoints: theme.breakpoints,
    radius: {
      xs: `${theme.borderRadius.xs}px`,
      sm: `${theme.borderRadius.sm}px`,
      md: `${theme.borderRadius.md}px`,
      lg: `${theme.borderRadius.lg}px`,
      xl: `${theme.borderRadius.xl}px`,
    },
    spacing: {
      xs: `${theme.spacing.xs}px`,
      sm: `${theme.spacing.sm}px`,
      md: `${theme.spacing.md}px`,
      lg: `${theme.spacing.lg}px`,
      xl: `${theme.spacing.xl}px`,
    },
    other: {
      colors: theme.colors,
    },
    components: {
      Button: {
        styles: (_mantineTheme: MantineTheme, props: { variant?: string }) => {
          const buttonVariant = getButtonVariant(props.variant);

          if (!buttonVariant) {
            return {};
          }

          const variantColors =
            buttonVariant === 'filled'
              ? buttonColors.primary
              : buttonVariant === 'light'
                ? buttonColors.secondary
                : buttonVariant === 'outline'
                  ? buttonColors.outline
                  : buttonVariant === 'subtle'
                    ? buttonColors.subtle
                    : buttonColors.transparent;
          const isOutline = buttonVariant === 'outline';
          const isTransparent = buttonVariant === 'transparent';
          const focusRing = `0 0 0 2px ${theme.colors.surface.background.page}, 0 0 0 4px ${buttonColors.primary.focus}`;

          return {
            root: {
              '&:active:not(:disabled):not([data-disabled])': {
                backgroundColor: isOutline
                  ? buttonColors.transparent.default
                  : variantColors.pressed,
                borderColor: isOutline
                  ? buttonColors.outline.pressed
                  : undefined,
                color:
                  buttonVariant === 'filled'
                    ? buttonColors.onPrimary.pressed
                    : buttonColors.outline.pressed,
              },
              '&:focus-visible': {
                boxShadow: focusRing,
                outline: 'none',
              },
              '&[data-selected="true"]:not(:disabled):not([data-disabled])': {
                backgroundColor: isOutline
                  ? buttonColors.transparent.selected
                  : variantColors.selected,
                borderColor: isOutline
                  ? buttonColors.outline.selected
                  : undefined,
              },
              '&:disabled, &[data-disabled="true"]': {
                backgroundColor:
                  isOutline || isTransparent
                    ? buttonColors.transparent.disabled
                    : buttonColors.disabled.default,
                borderColor: isOutline
                  ? buttonColors.outline.disabled
                  : undefined,
                color: theme.colors.text.disabled,
                opacity: 1,
              },
            },
          };
        },
      },
    },
  });
}
