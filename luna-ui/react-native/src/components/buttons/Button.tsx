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
      activeOpacity={0.7}
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
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  filled: {
    backgroundColor: "#007AFF",
  },
  filledText: {
    color: "#FFFFFF",
  },
  light: {
    backgroundColor: "#E1F0FF",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  subtle: {
    backgroundColor: "#F5F5F5",
  },
  transparent: {
    backgroundColor: "transparent",
  },
  variantText: {
    color: "#007AFF",
  },
});

export default Button;
