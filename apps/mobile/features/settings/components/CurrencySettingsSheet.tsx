import { useTheme } from '@guallet/luna-mobile';
import { Currency, ISO4217Currencies } from '@guallet/money';
import { useEffect, useMemo, useState } from 'react';
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

const availableCurrencies = Object.values(ISO4217Currencies)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((currency) => Currency.fromISOCode(currency.code));

interface CurrencySettingsSheetProps {
  visible: boolean;
  selectionMode: 'single' | 'multiple';
  selectedCodes: string[];
  title: string;
  disabled?: boolean;
  onClose: () => void;
  onSelect?: (currencyCode: string) => void;
  onDone?: (currencyCodes: string[]) => void;
}

export function CurrencySettingsSheet({
  visible,
  selectionMode,
  selectedCodes,
  title,
  disabled = false,
  onClose,
  onSelect,
  onDone,
}: Readonly<CurrencySettingsSheetProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const [query, setQuery] = useState('');
  const [draftCodes, setDraftCodes] = useState(selectedCodes);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setDraftCodes(selectedCodes);
    }
  }, [selectedCodes, visible]);

  const currencies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return availableCurrencies;

    return availableCurrencies.filter((currency) =>
      [currency.name, currency.code, currency.symbol].some((field) =>
        field.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query]);

  function handleCurrencyPress(code: string) {
    if (selectionMode === 'single') {
      onSelect?.(code);
      return;
    }

    setDraftCodes((current) =>
      current.includes(code)
        ? current.filter((selectedCode) => selectedCode !== code)
        : [...current, code],
    );
  }

  return (
    <BottomSheet
      contentPadding={0}
      isPresented={visible}
      onDismiss={onClose}
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
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text
            style={[
              styles.title,
              { color: colors.text.primary, fontSize: typography.sizes.xl },
            ]}
          >
            {title}
          </Text>
          <Pressable
            accessibilityLabel="Close currency picker"
            accessibilityRole="button"
            onPress={onClose}
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
              marginBottom: spacing.md,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <IconSymbol
            color={colors.text.secondary}
            name="magnifyingglass"
            size={22}
          />
          <TextInput
            accessibilityLabel="Search currencies"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!disabled}
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
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currencies.map((currency) => {
            const selected =
              selectionMode === 'single'
                ? selectedCodes.includes(currency.code)
                : draftCodes.includes(currency.code);

            return (
              <Pressable
                accessibilityRole={
                  selectionMode === 'single' ? 'radio' : 'checkbox'
                }
                accessibilityState={{ checked: selected, selected }}
                disabled={disabled}
                key={currency.code}
                onPress={() => handleCurrencyPress(currency.code)}
                style={({ pressed }) => [
                  styles.currencyRow,
                  {
                    borderBottomColor: colors.surface.border.primary,
                    opacity: pressed ? 0.7 : 1,
                    paddingVertical: spacing.md,
                  },
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
                    }}
                  >
                    {currency.symbol}
                  </Text>
                </View>
                <View style={styles.currencyDetails}>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.md,
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
                    {currency.code}
                  </Text>
                </View>
                <Text
                  style={{
                    color: selected
                      ? colors.accent.primary
                      : colors.text.secondary,
                    fontSize: typography.sizes.lg,
                  }}
                >
                  {selected ? '✓' : ''}
                </Text>
              </Pressable>
            );
          })}
          {currencies.length === 0 && (
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.md,
                paddingVertical: spacing.lg,
                textAlign: 'center',
              }}
            >
              No currencies found.
            </Text>
          )}
        </ScrollView>

        {selectionMode === 'multiple' && (
          <View
            style={[
              styles.footer,
              {
                borderTopColor: colors.surface.border.primary,
                paddingVertical: spacing.md,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => onDone?.(draftCodes)}
              style={({ pressed }) => [
                styles.doneButton,
                {
                  backgroundColor: colors.accent.primary,
                  borderRadius: borderRadius.md,
                  opacity: pressed ? 0.8 : 1,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.neutral.white,
                  fontSize: typography.sizes.md,
                  fontWeight: '600',
                }}
              >
                Done
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerSide: {
    width: 36,
  },
  title: {
    fontWeight: '700',
  },
  closeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  searchInput: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  searchText: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
  },
  currencyRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  currencyBadge: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  currencyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  footer: {
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  doneButton: {
    alignItems: 'center',
    minWidth: 88,
  },
});
