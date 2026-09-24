import { Currency, ISO4217Currencies } from '@guallet/money';
import { useTheme } from '@guallet/luna-mobile';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
} from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';

const availableCurrencies = Object.values(ISO4217Currencies)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((currency) => Currency.fromISOCode(currency.code));

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
  const { defaultCurrency, preferredCurrencies } = useMobileUserPreferences();
  const [isPresented, setIsPresented] = useState(false);
  const [query, setQuery] = useState('');

  const selectedCurrency = useMemo(() => {
    const normalizedValue = value?.trim().toUpperCase();

    return (
      availableCurrencies.find(
        (currency) => currency.code === normalizedValue,
      ) ?? null
    );
  }, [value]);

  const { prioritizedCurrencies, otherCurrencies } = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredCurrencies = normalizedQuery
      ? availableCurrencies.filter((currency) =>
          [currency.name, currency.symbol, currency.code].some((field) =>
            field.toLowerCase().includes(normalizedQuery),
          ),
        )
      : availableCurrencies;
    const prioritizedCodes = [defaultCurrency, ...preferredCurrencies]
      .filter((code): code is string => Boolean(code))
      .map((code) => code.toUpperCase())
      .filter((code, index, codes) => codes.indexOf(code) === index);
    const prioritizedCodeSet = new Set(prioritizedCodes);
    const prioritized = prioritizedCodes
      .map((code) =>
        filteredCurrencies.find((currency) => currency.code === code),
      )
      .filter((currency): currency is Currency => currency !== undefined);

    return {
      prioritizedCurrencies: prioritized,
      otherCurrencies: filteredCurrencies.filter(
        (currency) => !prioritizedCodeSet.has(currency.code),
      ),
    };
  }, [query, defaultCurrency, preferredCurrencies]);

  const openPicker = () => {
    if (disabled) return;
    setQuery('');
    setIsPresented(true);
  };

  const closePicker = () => {
    setIsPresented(false);
  };

  const selectCurrency = (currency: Currency) => {
    onValueChanged(currency.code);
    closePicker();
  };

  const renderCurrencyRow = (
    currency: Currency,
    index: number,
    total: number,
  ) => {
    const isSelected = selectedCurrency?.code === currency.code;

    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        key={currency.code}
        onPress={() => selectCurrency(currency)}
        style={[
          styles.currencyRow,
          {
            borderBottomColor: colors.surface.border.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          index === total - 1 && styles.lastCurrencyRow,
        ]}
      >
        <View
          style={[
            styles.currencyBadge,
            {
              backgroundColor: colors.button.secondary.default,
              borderRadius: borderRadius.md,
            },
          ]}
        >
          <Text
            style={[
              styles.currencySymbol,
              { color: colors.accent.primary, fontSize: typography.sizes.md },
            ]}
          >
            {currency.symbol}
          </Text>
        </View>
        <View style={styles.currencyDetails}>
          <Text
            style={[
              styles.currencyName,
              { color: colors.text.primary, fontSize: typography.sizes.md },
            ]}
          >
            {currency.name}
          </Text>
          <Text
            style={[
              styles.currencyCode,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            {currency.code}
          </Text>
        </View>
        <View
          style={[
            styles.radio,
            {
              borderColor: isSelected
                ? colors.accent.primary
                : colors.text.secondary,
            },
          ]}
        >
          {isSelected && (
            <View
              style={[
                styles.radioDot,
                { backgroundColor: colors.accent.primary },
              ]}
            />
          )}
        </View>
      </Pressable>
    );
  };

  const renderCurrencySection = (title: string, currencies: Currency[]) => (
    <View style={styles.currencySection}>
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text.primary, fontSize: typography.sizes.lg },
        ]}
      >
        {title}
      </Text>
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.surface.background.primary,
            borderRadius: borderRadius.xl,
          },
        ]}
      >
        {currencies.map((currency, index) =>
          renderCurrencyRow(currency, index, currencies.length),
        )}
      </View>
    </View>
  );

  const hasCurrencies =
    prioritizedCurrencies.length > 0 || otherCurrencies.length > 0;

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
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityValue={{
          text: selectedCurrency?.code ?? placeholder,
        }}
        disabled={disabled}
        onPress={openPicker}
        style={({ pressed }) => [
          styles.input,
          {
            backgroundColor: colors.surface.background.input,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          pressed && !disabled && { opacity: 0.7 },
          disabled && {
            backgroundColor: colors.surface.background.disabled,
            opacity: 0.6,
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
          style={[
            styles.chevron,
            { color: colors.text.secondary, fontSize: typography.sizes.lg },
          ]}
        >
          ⌄
        </Text>
      </Pressable>
      {description && (
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
      <BottomSheet
        containerColor={colors.surface.background.page}
        contentPadding={0}
        isPresented={isPresented}
        onDismiss={closePicker}
        showDragIndicator={false}
        snapPoints={['full']}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface.background.page,
              paddingHorizontal: spacing.md,
              paddingTop: spacing.md,
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <View style={styles.headerSide} />
            <Text
              style={[
                styles.sheetTitle,
                { color: colors.text.primary, fontSize: typography.sizes.xl },
              ]}
            >
              Choose currency
            </Text>
            <Pressable
              accessibilityLabel="Close currency picker"
              accessibilityRole="button"
              onPress={closePicker}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.surface.background.primary,
                  borderRadius: borderRadius.xl,
                },
              ]}
            >
              <IconSymbol color={colors.text.primary} name="xmark" size={22} />
            </Pressable>
          </View>
          <View
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.surface.background.primary,
                borderRadius: borderRadius.xl,
                marginBottom: spacing.lg,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <IconSymbol
              color={colors.text.primary}
              name="magnifyingglass"
              size={28}
            />
            <NativeTextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor={colors.text.placeholder}
              style={[
                styles.searchText,
                { color: colors.text.primary, fontSize: typography.sizes.lg },
              ]}
              value={query}
            />
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.listContent,
              { gap: spacing.lg, paddingBottom: spacing.lg },
            ]}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {hasCurrencies ? (
              <>
                {prioritizedCurrencies.length > 0 &&
                  renderCurrencySection('Popular', prioritizedCurrencies)}
                {otherCurrencies.length > 0 &&
                  renderCurrencySection('All', otherCurrencies)}
              </>
            ) : (
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.text.secondary,
                    fontSize: typography.sizes.md,
                  },
                ]}
              >
                No currencies found.
              </Text>
            )}
          </ScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    fontWeight: '500',
  },
  input: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
  },
  value: {
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  description: {},
  sheet: {
    flex: 1,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
  },
  headerSide: {
    width: 48,
  },
  sheetTitle: {
    fontWeight: '700',
  },
  closeButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  searchInput: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 64,
  },
  searchText: {
    flex: 1,
    marginLeft: 12,
    padding: 0,
  },
  listContent: {
    paddingTop: 4,
  },
  currencySection: {},
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    overflow: 'hidden',
  },
  currencyRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 76,
  },
  lastCurrencyRow: {
    borderBottomWidth: 0,
  },
  currencyBadge: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  currencySymbol: {
    fontWeight: '700',
  },
  currencyDetails: {
    flex: 1,
    marginLeft: 14,
  },
  currencyName: {
    fontWeight: '500',
  },
  currencyCode: {
    marginTop: 2,
  },
  radio: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 3,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  radioDot: {
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  emptyText: {
    paddingVertical: 16,
    textAlign: 'center',
  },
});
