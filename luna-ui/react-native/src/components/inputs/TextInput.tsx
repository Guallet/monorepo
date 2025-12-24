import React from "react";
import { View, Text, TextInput as RNTextInput, StyleSheet } from "react-native";

export interface TextInputProps
  extends React.ComponentProps<typeof RNTextInput> {
  label?: string;
  description?: string;
  //   placeholder?: string;
  disabled?: boolean;
  error?: string | null;
}

export function TextInput({
  label,
  description,
  placeholder,
  disabled = false,
  error,
  style,
  ...props
}: Readonly<TextInputProps>) {
  const hasError = error != null;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        <RNTextInput
          style={[styles.input, style]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={!disabled}
          {...props}
        />
      </View>

      {description && !hasError && (
        <Text style={styles.description}>{description}</Text>
      )}

      {hasError && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputContainerDisabled: {
    backgroundColor: "#F9FAFB",
    opacity: 0.6,
  },
  input: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
    padding: 0,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
  error: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 6,
  },
});
