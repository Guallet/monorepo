import type { Currency } from '@guallet/money';
import { useTheme } from '@guallet/luna-mobile';
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  formatAmount,
  isValidAmountText,
  parseAmountText,
} from './amountInputUtils';

export interface AmountInputProps {
  value: number | null;
  currency: Currency;
  onChange: (value: number | null) => void;
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
  disabled = false,
  error,
  label,
  containerStyle,
  inputStyle,
  currencySymbolStyle,
}: Readonly<AmountInputProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [text, setText] = useState(() => formatAmount(value, currency, true));
  const focused = useRef(false);
  const lastEmittedValue = useRef(value);
  const currencyKey = `${currency.code}:${currency.decimalPlaces}`;
  const previousCurrencyKey = useRef(currencyKey);
  const hasError = error != null;
  let amountColor = colors.text.primary;
  if (value !== null && value < 0) {
    amountColor = colors.status.error;
  } else if (value !== null && value > 0) {
    amountColor = colors.support.primary;
  }

  useEffect(() => {
    if (
      previousCurrencyKey.current !== currencyKey ||
      !Object.is(lastEmittedValue.current, value)
    ) {
      setText(formatAmount(value, currency, !focused.current));
    }

    lastEmittedValue.current = value;
    previousCurrencyKey.current = currencyKey;
  }, [currency, currencyKey, value]);

  function handleChangeText(nextText: string): void {
    if (!isValidAmountText(nextText, currency.decimalPlaces)) {
      return;
    }

    setText(nextText);
    const parsed = parseAmountText(nextText);
    if (parsed !== undefined) {
      lastEmittedValue.current = parsed;
      onChange(parsed);
    }
  }

  function handleBlur(): void {
    focused.current = false;
    const parsed = parseAmountText(text);
    if (parsed === undefined) {
      setText('');
      lastEmittedValue.current = null;
      onChange(null);
      return;
    }

    setText(formatAmount(parsed, currency, true));
  }

  return (
    <View
      style={[styles.container, { marginBottom: spacing.md }, containerStyle]}
    >
      {label ? (
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
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: hasError
              ? colors.surface.background.error
              : colors.surface.background.input,
            borderColor: hasError
              ? colors.status.error
              : colors.surface.border.input,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          disabled && {
            backgroundColor: colors.surface.background.disabled,
            opacity: 0.6,
          },
        ]}
      >
        <Text
          accessible={false}
          style={[
            styles.symbol,
            { color: amountColor, fontSize: typography.sizes.md },
            currencySymbolStyle,
          ]}
        >
          {currency.symbol}
        </Text>
        <RNTextInput
          accessibilityLabel={`${label ?? 'Amount'} (${currency.code})`}
          accessibilityHint={error ?? undefined}
          accessibilityState={{ disabled }}
          editable={!disabled}
          keyboardType="numbers-and-punctuation"
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={() => {
            focused.current = true;
            setText(formatAmount(value, currency, false));
          }}
          style={[
            styles.input,
            { color: amountColor, fontSize: typography.sizes.md },
            inputStyle,
          ]}
          value={text}
        />
      </View>

      {hasError ? (
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: { fontWeight: '500' },
  inputContainer: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
  symbol: { fontVariant: ['tabular-nums'], fontWeight: '700' },
  input: {
    flex: 1,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    padding: 0,
  },
  error: {},
});
