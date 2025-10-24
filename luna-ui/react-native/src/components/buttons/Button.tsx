import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

type ButtonVariant = "filled" | "light" | "outline" | "subtle" | "transparent";

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
  variant = "filled",
  style,
  disabled = false,
}) => {
  const getVariantStyles = (): ViewStyle => {
    if (disabled) {
      switch (variant) {
        case "filled":
          return styles.filledDisabled;
        case "light":
          return styles.lightDisabled;
        case "outline":
          return styles.outlineDisabled;
        case "subtle":
          return styles.subtleDisabled;
        case "transparent":
          return styles.transparentDisabled;
        default:
          return styles.filledDisabled;
      }
    }

    switch (variant) {
      case "filled":
        return styles.filled;
      case "light":
        return styles.light;
      case "outline":
        return styles.outline;
      case "subtle":
        return styles.subtle;
      case "transparent":
        return styles.transparent;
      default:
        return styles.filled;
    }
  };

  const getTextStyles = (): TextStyle => {
    if (disabled) {
      return styles.disabledText;
    }

    switch (variant) {
      case "filled":
        return styles.filledText;
      case "light":
      case "outline":
      case "subtle":
      case "transparent":
        return styles.variantText;
      default:
        return styles.filledText;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getVariantStyles(), style]}
      onPress={onClick}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {typeof children === "string" ? (
        <Text style={[styles.text, getTextStyles()]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  filled: {
    backgroundColor: "#007AFF",
  },
  filledDisabled: {
    backgroundColor: "#D1D5DB",
  },
  filledText: {
    color: "#FFFFFF",
  },
  light: {
    backgroundColor: "#E1F0FF",
  },
  lightDisabled: {
    backgroundColor: "#F3F4F6",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  outlineDisabled: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  subtle: {
    backgroundColor: "#F5F5F5",
  },
  subtleDisabled: {
    backgroundColor: "#F9FAFB",
  },
  transparent: {
    backgroundColor: "transparent",
  },
  transparentDisabled: {
    backgroundColor: "transparent",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  variantText: {
    color: "#007AFF",
  },
});

export default Button;
