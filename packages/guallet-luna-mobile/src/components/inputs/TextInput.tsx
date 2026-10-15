import React from 'react';
import { View, Text, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export interface TextInputProps extends React.ComponentProps<
  typeof RNTextInput
> {
  label?: string;
  description?: string;
  //   placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  rightSection?: React.ReactNode;
}

export function TextInput({
  label,
  description,
  placeholder,
  disabled = false,
  error,
  rightSection,
  style,
  ...props
}: Readonly<TextInputProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const hasError = error != null;

  return (
    <View style={[styles.container, { marginBottom: spacing.md }]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.text.primary,
              fontSize: typography.sizes.md,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface.background.input,
            borderColor: hasError
              ? colors.status.error
              : colors.surface.border.input,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          hasError && { backgroundColor: colors.surface.background.error },
          disabled && {
            backgroundColor: colors.surface.background.disabled,
            opacity: 0.6,
          },
        ]}
      >
        <RNTextInput
          style={[
            styles.input,
            { color: colors.text.primary, fontSize: typography.sizes.md },
            style,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          editable={!disabled}
          {...props}
        />
        {rightSection ? (
          <View style={styles.rightSection}>{rightSection}</View>
        ) : null}
      </View>

      {description && !hasError && (
        <Text
          style={[
            styles.description,
            {
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          {description}
        </Text>
      )}

      {hasError && (
        <Text
          style={[
            styles.error,
            {
              color: colors.status.error,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    fontWeight: '500',
  },
  inputContainer: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  description: {},
  error: {},
});
