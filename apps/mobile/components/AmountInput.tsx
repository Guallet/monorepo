import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@guallet/luna-mobile';
import type { Currency } from '@guallet/money';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { CurrencyPickerSheet } from './CurrencyPickerSheet';
import {
  formatAmount,
  isValidAmountText,
  normalizeAmount,
  parseAmountText,
} from './amountInputUtils';

export interface AmountInputProps {
  value: number | null;
  currency: Currency;
  onChange: (value: number | null) => void;
  /** The parent owns the selected currency and updates the currency prop. */
  onCurrencyChange: (currency: Currency) => void;
  disabled?: boolean;
  error?: string | null;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  currencySymbolStyle?: StyleProp<TextStyle>;
}

export function AmountInput({
  value,
  currency,
  onChange,
  onCurrencyChange,
  disabled = false,
  error,
  label = 'Amount',
  containerStyle,
  inputStyle,
  currencySymbolStyle,
}: Readonly<AmountInputProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [text, setText] = useState(() => formatAmount(value, currency, true));
  const [focused, setFocused] = useState(false);
  const [pickerPresented, setPickerPresented] = useState(false);
  const lastEmittedValue = useRef(value);
  const currencyKey = `${currency.code}:${currency.decimalPlaces}`;
  const previousCurrencyKey = useRef(currencyKey);
  const lastNormalization = useRef<string | null>(null);
  const hasError = error != null;
  let backgroundColor = colors.surface.background.input;
  if (disabled) backgroundColor = colors.surface.background.disabled;
  else if (hasError) backgroundColor = colors.surface.background.error;
  let borderColor = colors.surface.border.input;
  if (hasError) borderColor = colors.status.error;
  else if (focused || pickerPresented) borderColor = colors.accent.primary;

  useEffect(() => {
    const normalized = normalizeAmount(value, currency);
    if (!Object.is(value, normalized)) {
      const normalizationKey = `${currencyKey}:${value}`;
      if (lastNormalization.current !== normalizationKey) {
        lastNormalization.current = normalizationKey;
        onChange(normalized);
      }
    } else {
      lastNormalization.current = null;
    }

    if (
      previousCurrencyKey.current !== currencyKey ||
      !Object.is(lastEmittedValue.current, value)
    ) {
      setText(formatAmount(normalized, currency, !focused));
    }

    lastEmittedValue.current = normalized;
    previousCurrencyKey.current = currencyKey;
  }, [currency, currencyKey, focused, onChange, value]);

  function handleChangeText(nextText: string): void {
    if (!isValidAmountText(nextText, currency.decimalPlaces)) return;

    setText(nextText);
    const parsed = parseAmountText(nextText);
    if (parsed !== undefined) {
      lastEmittedValue.current = parsed;
      onChange(parsed);
    }
  }

  function handleBlur(): void {
    setFocused(false);
    const parsed = parseAmountText(text);
    const normalized =
      parsed === undefined ? null : normalizeAmount(parsed, currency);
    setText(formatAmount(normalized, currency, true));
    if (!Object.is(lastEmittedValue.current, normalized)) {
      lastEmittedValue.current = normalized;
      onChange(normalized);
    }
  }

  function openCurrencyPicker(): void {
    Keyboard.dismiss();
    setPickerPresented(true);
  }

  function handleCurrencyChange(selectedCurrency: Currency): void {
    const normalized = normalizeAmount(value, selectedCurrency);
    if (!Object.is(normalized, value)) {
      lastEmittedValue.current = normalized;
      onChange(normalized);
    }
    onCurrencyChange(selectedCurrency);
  }

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
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
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor,
            borderColor,
            borderRadius: borderRadius.lg,
          },
        ]}
      >
        <Text
          accessible={false}
          style={[
            styles.symbol,
            {
              color: colors.text.primary,
              fontSize: typography.sizes.md,
              marginLeft: spacing.md,
            },
            currencySymbolStyle,
          ]}
        >
          {currency.symbol}
        </Text>
        <RNTextInput
          accessibilityLabel={`${label} (${currency.code})`}
          accessibilityHint={error ?? undefined}
          accessibilityState={{ disabled }}
          editable={!disabled}
          keyboardType="numbers-and-punctuation"
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={() => {
            setFocused(true);
            setText(
              formatAmount(normalizeAmount(value, currency), currency, false),
            );
          }}
          style={[
            styles.input,
            { color: colors.text.primary, fontSize: typography.sizes.md },
            inputStyle,
          ]}
          value={text}
        />
        <Pressable
          accessibilityLabel={`Choose currency, ${currency.code}`}
          accessibilityHint="Opens the currency picker"
          accessibilityRole="button"
          accessibilityState={{ disabled, expanded: pickerPresented }}
          disabled={disabled}
          onPress={openCurrencyPicker}
          style={[
            styles.currencyButton,
            {
              borderLeftColor: colors.surface.border.input,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.md,
            }}
          >
            {currency.code}
          </Text>
          <MaterialIcons
            color={colors.text.secondary}
            name="keyboard-arrow-down"
            size={20}
          />
        </Pressable>
      </View>
      {hasError && (
        <Text
          style={{
            color: colors.status.error,
            fontSize: typography.sizes.sm,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
      <CurrencyPickerSheet
        isPresented={pickerPresented}
        onDismiss={() => setPickerPresented(false)}
        onSelect={handleCurrencyChange}
        selectedCurrency={currency}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    overflow: 'hidden',
  },
  symbol: { fontVariant: ['tabular-nums'], fontWeight: '500' },
  input: {
    flex: 1,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
    minWidth: 0,
    padding: 0,
  },
  currencyButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderLeftWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minWidth: 96,
  },
});
