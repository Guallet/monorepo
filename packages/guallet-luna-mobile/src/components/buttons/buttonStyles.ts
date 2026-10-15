import type { ButtonColors, Colors } from '@guallet/theme';

export type ButtonVariant =
  | 'filled'
  | 'light'
  | 'outline'
  | 'subtle'
  | 'transparent';

export type ButtonInteractionState = keyof ButtonColors['primary'];

export interface ButtonStyleValues {
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  textColor: string;
}

export interface ButtonInteractionStateOptions {
  disabled: boolean;
  focused: boolean;
  pressed: boolean;
  selected: boolean;
}

export function getButtonInteractionState({
  disabled,
  focused,
  pressed,
  selected,
}: ButtonInteractionStateOptions): ButtonInteractionState {
  if (disabled) {
    return 'disabled';
  }

  if (pressed) {
    return 'pressed';
  }

  if (focused) {
    return 'focus';
  }

  if (selected) {
    return 'selected';
  }

  return 'default';
}

function getVariantColors(
  buttonColors: ButtonColors,
  variant: ButtonVariant,
): ButtonColors['primary'] {
  switch (variant) {
    case 'filled':
      return buttonColors.primary;
    case 'light':
      return buttonColors.secondary;
    case 'outline':
      return buttonColors.outline;
    case 'subtle':
      return buttonColors.subtle;
    case 'transparent':
      return buttonColors.transparent;
  }
}

export function getButtonStyles(
  colors: Colors,
  variant: ButtonVariant,
  state: ButtonInteractionState,
): ButtonStyleValues {
  const variantColors = getVariantColors(colors.button, variant);
  const isDisabled = state === 'disabled';
  const isFilled = variant === 'filled';
  const isOutline = variant === 'outline';
  const isTransparent = variant === 'transparent';

  return {
    backgroundColor: isDisabled
      ? isOutline || isTransparent
        ? colors.button.transparent.default
        : colors.button.disabled.default
      : isOutline
        ? colors.button.transparent.default
        : variantColors[state],
    ...(isOutline && {
      borderColor: isDisabled
        ? colors.button.outline.disabled
        : colors.button.outline[state],
      borderWidth: 1,
    }),
    textColor: isDisabled
      ? colors.text.disabled
      : isFilled
        ? colors.button.onPrimary[state]
        : colors.button.outline[state],
  };
}
