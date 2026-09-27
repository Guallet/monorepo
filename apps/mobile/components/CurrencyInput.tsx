import { useTheme } from '@guallet/luna-mobile';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CurrencyPickerSheet, findCurrency } from './CurrencyPickerSheet';

export interface CurrencyInputProps {
  value: string | null;
  onValueChanged: (value: string | null) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onValueChanged,
  label = 'Currency',
  description,
  placeholder = 'Select a currency',
  disabled = false,
}: Readonly<CurrencyInputProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const [isPresented, setIsPresented] = useState(false);
  const selectedCurrency = findCurrency(value);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight: '500',
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityValue={{ text: selectedCurrency?.code ?? placeholder }}
        disabled={disabled}
        onPress={() => setIsPresented(true)}
        style={[
          styles.input,
          {
            backgroundColor: disabled
              ? colors.surface.background.disabled
              : colors.surface.background.input,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            {
              color: selectedCurrency
                ? colors.text.primary
                : colors.text.placeholder,
              fontSize: typography.sizes.md,
            },
          ]}
        >
          {selectedCurrency
            ? `${selectedCurrency.symbol} - ${selectedCurrency.name} - ${selectedCurrency.code}`
            : placeholder}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.lg,
          }}
        >
          ⌄
        </Text>
      </Pressable>
      {description && (
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
            marginTop: spacing.xs,
          }}
        >
          {description}
        </Text>
      )}
      <CurrencyPickerSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
        onSelect={(currency) => onValueChanged(currency.code)}
        selectedCurrency={selectedCurrency}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
  value: { flex: 1 },
});
