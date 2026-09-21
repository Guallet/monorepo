import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { BudgetDto } from '@guallet/api-client';
import {
  useAccounts,
  useBudgetMutations,
  useCategories,
  useUserSettings,
} from '@guallet/api-react';
import { Button, TextInput, useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { CategorySelectionSheet } from '../components/CategorySelectionSheet';
import { IconSelectionSheet } from '../components/IconSelectionSheet';

const COLOR_SWATCHES = [
  '#4c6ef5',
  '#228be6',
  '#15aabf',
  '#12b886',
  '#40c057',
  '#82c91e',
  '#fab005',
  '#fd7e14',
  '#fa5252',
  '#e64980',
  '#be4bdb',
  '#7950f2',
  '#868e96',
  '#25262b',
];

interface BudgetFormScreenProps {
  budget?: BudgetDto | null;
  isError?: boolean;
  isLoading?: boolean;
}

export default function BudgetFormScreen({
  budget = null,
  isError = false,
  isLoading = false,
}: Readonly<BudgetFormScreenProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { settings } = useUserSettings();
  const { createBudgetMutation, updateBudgetMutation } = useBudgetMutations();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [colour, setColour] = useState(COLOR_SWATCHES[0]);
  const [icon, setIcon] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  useEffect(() => {
    if (budget) {
      setName(budget.name);
      setAmount(String(budget.amount));
      setCurrency(budget.currency);
      setColour(budget.colour || COLOR_SWATCHES[0]);
      setIcon(budget.icon || '');
      setCategoryIds(budget.categories);
    }
  }, [budget]);

  useEffect(() => {
    const defaultCurrency = settings?.currencies.default_currency;
    if (!budget && defaultCurrency && currency === 'GBP') {
      setCurrency(defaultCurrency);
    }
  }, [budget, currency, settings?.currencies.default_currency]);

  const currencyOptions = useMemo(() => {
    const values = [
      settings?.currencies.default_currency,
      ...accounts.map((account) => account.currency),
    ].filter((value): value is string => Boolean(value));
    return [...new Set(values.map((value) => value.toUpperCase()))];
  }, [accounts, settings?.currencies.default_currency]);

  const selectedCategoryNames = useMemo(
    () =>
      categories
        .filter((category) => categoryIds.includes(category.id))
        .map((category) => category.name),
    [categories, categoryIds],
  );

  const isPending =
    createBudgetMutation.isPending || updateBudgetMutation.isPending;

  async function submit() {
    const normalizedName = name.trim();
    const normalizedCurrency = currency.trim().toUpperCase();
    const parsedAmount = Number(amount.replace(',', '.'));

    if (normalizedName.length < 2) {
      setError('Enter a budget name with at least two characters.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a positive budget amount.');
      return;
    }
    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      setError('Use a three-letter currency code, such as GBP or EUR.');
      return;
    }
    if (categoryIds.length === 0) {
      setError('Select at least one category.');
      return;
    }

    setError(null);
    try {
      if (budget) {
        await updateBudgetMutation.mutateAsync({
          id: budget.id,
          request: {
            amount: parsedAmount,
            categories: categoryIds,
            colour,
            currency: normalizedCurrency,
            icon: icon || undefined,
            name: normalizedName,
          },
        });
      } else {
        await createBudgetMutation.mutateAsync({
          request: {
            amount: parsedAmount,
            categories: categoryIds,
            colour,
            currency: normalizedCurrency,
            icon: icon || undefined,
            name: normalizedName,
          },
        });
      }
      // The mutation hooks invalidate all budget queries. Returning to the tab
      // lets it refetch the month the user was viewing.
      router.replace('/budgets');
    } catch {
      setError(
        `Couldn’t ${budget ? 'update' : 'create'} this budget. Please try again.`,
      );
    }
  }

  if (isLoading) {
    return (
      <AppScreen headerTitle="Edit budget">
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent.primary} />
        </View>
      </AppScreen>
    );
  }

  if (isError) {
    return (
      <AppScreen headerTitle="Budget">
        <View style={[styles.centered, { padding: spacing.lg }]}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: '700',
            }}
          >
            Couldn’t load this budget
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginTop: spacing.xs,
            }}
          >
            Please go back and try again.
          </Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen headerTitle={budget ? 'Edit budget' : 'New budget'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { gap: spacing.md, padding: spacing.md },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
              },
            ]}
          >
            <TextInput
              autoCapitalize="words"
              label="Name"
              onChangeText={setName}
              placeholder="e.g. Groceries"
              value={name}
            />
            <TextInput
              keyboardType="decimal-pad"
              label="Monthly amount"
              onChangeText={setAmount}
              placeholder="0.00"
              value={amount}
            />
            <TextInput
              autoCapitalize="characters"
              autoCorrect={false}
              label="Currency"
              maxLength={3}
              onChangeText={setCurrency}
              placeholder="GBP"
              value={currency}
            />
            {currencyOptions.length > 0 && (
              <View style={[styles.chips, { gap: spacing.xs }]}>
                {currencyOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setCurrency(option)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          currency === option
                            ? colors.button.secondary.default
                            : colors.surface.background.secondary,
                        borderColor:
                          currency === option
                            ? colors.accent.primary
                            : colors.surface.border.primary,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.xs,
                      }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <FieldButton
              label="Categories"
              value={
                selectedCategoryNames.length > 0
                  ? `${selectedCategoryNames.length} selected`
                  : 'Select categories'
              }
              onPress={() => setShowCategories(true)}
            />

            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.md,
                fontWeight: '500',
                marginBottom: spacing.xs,
              }}
            >
              Color
            </Text>
            <View style={[styles.colorGrid, { gap: spacing.sm }]}>
              {COLOR_SWATCHES.map((swatch) => (
                <Pressable
                  key={swatch}
                  accessibilityLabel={`Choose color ${swatch}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: colour === swatch }}
                  onPress={() => setColour(swatch)}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: swatch,
                      borderColor:
                        colour === swatch
                          ? colors.text.primary
                          : colors.surface.border.primary,
                      borderWidth: colour === swatch ? 3 : 1,
                    },
                  ]}
                />
              ))}
            </View>

            <FieldButton
              label="Icon"
              value={icon || 'Choose an icon'}
              onPress={() => setShowIcons(true)}
            />
          </View>

          {error && (
            <Text
              style={{
                color: colors.status.error,
                fontSize: typography.sizes.sm,
              }}
            >
              {error}
            </Text>
          )}

          <View style={[styles.actions, { gap: spacing.sm }]}>
            <Button
              disabled={isPending}
              onClick={() => router.back()}
              variant="outline"
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => void submit()}
              style={styles.actionButton}
            >
              {isPending
                ? 'Saving…'
                : budget
                  ? 'Save changes'
                  : 'Create budget'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CategorySelectionSheet
        categories={categories}
        onApply={setCategoryIds}
        onDismiss={() => setShowCategories(false)}
        selectedIds={categoryIds}
        visible={showCategories}
      />
      <IconSelectionSheet
        onDismiss={() => setShowIcons(false)}
        onSelect={setIcon}
        selectedIcon={icon}
        visible={showIcons}
      />
    </AppScreen>
  );
}

function FieldButton({
  label,
  onPress,
  value,
}: Readonly<{
  label: string;
  onPress: () => void;
  value: string;
}>) {
  const { colors, borderRadius, spacing, typography } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
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
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.fieldButton,
          {
            backgroundColor: colors.surface.background.input,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.lg,
            opacity: pressed ? 0.7 : 1,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <Text
          style={{ color: colors.text.primary, fontSize: typography.sizes.md }}
        >
          {value}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.md,
          }}
        >
          ›
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  formCard: {
    borderWidth: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorSwatch: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  fieldButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 'auto',
  },
  actionButton: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
