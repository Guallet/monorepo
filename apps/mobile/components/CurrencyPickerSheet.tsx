import { useTheme } from '@guallet/luna-mobile';
import { Currency, ISO4217Currencies } from '@guallet/money';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';

const availableCurrencies = Object.values(ISO4217Currencies)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((currency) => Currency.fromISOCode(currency.code));

export function findCurrency(code: string | null): Currency | null {
  const normalized = code?.trim().toUpperCase();
  return (
    availableCurrencies.find((currency) => currency.code === normalized) ?? null
  );
}

interface CurrencyPickerSheetProps {
  isPresented: boolean;
  selectedCurrency: Currency | null;
  onSelect: (currency: Currency) => void;
  onDismiss: () => void;
}

export function CurrencyPickerSheet({
  isPresented,
  selectedCurrency,
  onSelect,
  onDismiss,
}: Readonly<CurrencyPickerSheetProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const { defaultCurrency, preferredCurrencies } = useMobileUserPreferences();
  const [query, setQuery] = useState('');

  const { popular, other } = useMemo(() => {
    const search = query.trim().toLowerCase();
    const matches = availableCurrencies.filter(
      (currency) =>
        !search ||
        [currency.name, currency.symbol, currency.code].some((field) =>
          field.toLowerCase().includes(search),
        ),
    );
    const preferredCodes = [
      selectedCurrency?.code,
      defaultCurrency,
      ...preferredCurrencies,
    ]
      .filter((code): code is string => Boolean(code))
      .map((code) => code.toUpperCase())
      .filter((code, index, codes) => codes.indexOf(code) === index);
    const preferredSet = new Set(preferredCodes);

    return {
      popular: preferredCodes
        .map((code) => matches.find((currency) => currency.code === code))
        .filter((currency): currency is Currency => currency !== undefined),
      other: matches.filter((currency) => !preferredSet.has(currency.code)),
    };
  }, [query, selectedCurrency?.code, defaultCurrency, preferredCurrencies]);

  function close(): void {
    setQuery('');
    onDismiss();
  }

  function select(currency: Currency): void {
    onSelect(currency);
    close();
  }

  function renderSection(title: string, currencies: Currency[]) {
    if (currencies.length === 0) return null;

    return (
      <View>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              marginBottom: spacing.sm,
            },
          ]}
        >
          {title}
        </Text>
        <View
          style={{
            backgroundColor: colors.surface.background.primary,
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          {currencies.map((currency, index) => {
            const selected = selectedCurrency?.code === currency.code;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={`${currency.name}, ${currency.code}`}
                accessibilityState={{ selected }}
                key={currency.code}
                onPress={() => select(currency)}
                style={[
                  styles.currencyRow,
                  {
                    borderBottomColor: colors.surface.border.primary,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  },
                  index === currencies.length - 1 && styles.lastRow,
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
                    style={{
                      color: colors.accent.primary,
                      fontSize: typography.sizes.md,
                      fontWeight: '700',
                    }}
                  >
                    {currency.symbol}
                  </Text>
                </View>
                <View
                  style={[styles.currencyDetails, { marginLeft: spacing.md }]}
                >
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.md,
                      fontWeight: '500',
                    }}
                  >
                    {currency.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                    }}
                  >
                    {currency.code} · {currency.decimalPlaces} decimals
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: selected
                        ? colors.accent.primary
                        : colors.text.secondary,
                    },
                  ]}
                >
                  {selected && (
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
          })}
        </View>
      </View>
    );
  }

  return (
    <BottomSheet
      containerColor={colors.surface.background.page}
      contentPadding={0}
      isPresented={isPresented}
      onDismiss={close}
      snapPoints={['half', 'full']}
    >
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface.background.page,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
          },
        ]}
      >
        <View style={styles.sheetHeader}>
          <View style={styles.headerSide} />
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.xl,
              fontWeight: '700',
            }}
          >
            Choose currency
          </Text>
          <Pressable
            accessibilityLabel="Close currency picker"
            accessibilityRole="button"
            onPress={close}
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
              borderRadius: borderRadius.lg,
              marginBottom: spacing.lg,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <IconSymbol
            color={colors.text.secondary}
            name="magnifyingglass"
            size={24}
          />
          <TextInput
            accessibilityLabel="Search currencies"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Search currencies"
            placeholderTextColor={colors.text.placeholder}
            style={[
              styles.searchText,
              { color: colors.text.primary, fontSize: typography.sizes.md },
            ]}
            value={query}
          />
        </View>
        <ScrollView
          contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.lg }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {popular.length + other.length > 0 ? (
            <>
              {renderSection('Popular', popular)}
              {renderSection('All', other)}
            </>
          ) : (
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.md,
                paddingVertical: spacing.md,
              }}
            >
              No currencies found.
            </Text>
          )}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
  },
  headerSide: { width: 48 },
  closeButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  searchInput: { alignItems: 'center', flexDirection: 'row', minHeight: 56 },
  searchText: { flex: 1, marginLeft: 12, padding: 0 },
  sectionTitle: { fontWeight: '700' },
  currencyRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 74,
  },
  lastRow: { borderBottomWidth: 0 },
  currencyBadge: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  currencyDetails: { flex: 1 },
  radio: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioDot: { borderRadius: 6, height: 12, width: 12 },
});
