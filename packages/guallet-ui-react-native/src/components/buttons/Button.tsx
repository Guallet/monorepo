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
          return { backgroundColor: colors.disabled };
        case 'light':
          return { backgroundColor: colors.disabled };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.disabled,
          };
        case 'subtle':
          return { backgroundColor: colors.disabled };
        case 'transparent':
          return { backgroundColor: 'transparent' };
        default:
          return { backgroundColor: colors.disabled };
      }
    }

    switch (variant) {
      case 'filled':
        return { backgroundColor: colors.primary };
      case 'light':
        return { backgroundColor: colors.primarySubtle };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
      case 'subtle':
        return { backgroundColor: colors.surface };
      case 'transparent':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyles = (): TextStyle => {
    if (disabled) {
      return { color: colors.disabledText };
    }

    switch (variant) {
      case 'filled':
        return { color: colors.onPrimary };
      case 'light':
      case 'outline':
      case 'subtle':
      case 'transparent':
        return { color: colors.primary };
      default:
        return { color: colors.onPrimary };
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
