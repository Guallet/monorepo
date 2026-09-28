import { CurrencyPicker, useTheme } from '@guallet/luna-mobile';
import { Text, View } from 'react-native';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { availableCurrencies } from './currencyPickerData';

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
  const { colors, spacing, typography } = useTheme();
  const { defaultCurrency, preferredCurrencies } = useMobileUserPreferences();

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
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
      ) : null}
      <CurrencyPicker
        selectionMode="single"
        value={value}
        currencies={availableCurrencies}
        defaultCurrencyCode={defaultCurrency}
        preferredCurrencyCodes={preferredCurrencies}
        onChange={onValueChanged}
        placeholder={placeholder}
        disabled={disabled}
      />
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
    </View>
  );
}
