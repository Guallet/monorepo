import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';

type ButtonVariant = 'filled' | 'light' | 'outline' | 'subtle' | 'transparent';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'filled',
  style,
  disabled = false,
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const getVariantStyles = (): ViewStyle => {
    if (disabled) {
      switch (variant) {
        case 'filled':
          return { backgroundColor: colors.button.disabled };
        case 'light':
          return { backgroundColor: colors.button.disabled };
        case 'outline':
          return {
            backgroundColor: colors.button.transparent,
            borderWidth: 1,
            borderColor: colors.surface.border.disabled,
          };
        case 'subtle':
          return { backgroundColor: colors.button.disabled };
        case 'transparent':
          return { backgroundColor: colors.button.transparent };
        default:
          return { backgroundColor: colors.button.disabled };
      }
    }

    switch (variant) {
      case 'filled':
        return { backgroundColor: colors.button.primary };
      case 'light':
        return { backgroundColor: colors.button.secondary };
      case 'outline':
        return {
          backgroundColor: colors.button.transparent,
          borderWidth: 1,
          borderColor: colors.button.outline,
        };
      case 'subtle':
        return { backgroundColor: colors.button.subtle };
      case 'transparent':
        return { backgroundColor: colors.button.transparent };
      default:
        return { backgroundColor: colors.button.primary };
    }
  };

  const getTextStyles = (): TextStyle => {
    if (disabled) {
      return { color: colors.text.disabled };
    }

    switch (variant) {
      case 'filled':
        return { color: colors.button.onPrimary };
      case 'light':
      case 'outline':
      case 'subtle':
      case 'transparent':
        return { color: colors.button.outline };
      default:
        return { color: colors.button.onPrimary };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderRadius: borderRadius.md,
          height: typography.sizes.md + spacing.md * 2,
        },
        getVariantStyles(),
        style,
      ]}
      onPress={onClick}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.text,
            { fontSize: typography.sizes.md },
            getTextStyles(),
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
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
