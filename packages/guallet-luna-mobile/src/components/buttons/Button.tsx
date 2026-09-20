import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import {
  getButtonInteractionState,
  getButtonStyles,
  type ButtonVariant,
} from './buttonStyles';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  disabled?: boolean;
  selected?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'filled',
  style,
  disabled = false,
  selected = false,
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [focused, setFocused] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const textState = getButtonInteractionState({
    disabled,
    focused,
    pressed,
    selected,
  });

  return (
    <Pressable
      style={() => {
        const buttonStyles = getButtonStyles(
          colors,
          variant,
          getButtonInteractionState({
            disabled,
            focused,
            pressed,
            selected,
          }),
        );

        return [
          styles.button,
          {
            borderRadius: borderRadius.md,
            height: typography.sizes.md + spacing.md * 2,
            backgroundColor: buttonStyles.backgroundColor,
            borderColor: buttonStyles.borderColor,
            borderWidth: buttonStyles.borderWidth,
          },
          style,
        ];
      }}
      onPress={onClick}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            { fontSize: typography.sizes.md },
            {
              color: getButtonStyles(colors, variant, textState).textColor,
            },
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
