import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BudgetDto } from '@guallet/api-client';
import {
  useAccounts,
  useBudgetMutations,
  useCategories,
} from '@guallet/api-react';
import {
  Button,
  ColorPicker,
  IconPicker,
  TextInput,
  useTheme,
} from '@guallet/luna-mobile';
import { ChevronRightIcon } from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { CurrencyInput } from '@/components/CurrencyInput';
import { availableCurrencies } from '@/components/currencyPickerData';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import {
  getAllowedBudgetCurrencies,
  validateBudgetForm,
  type BudgetFormErrors,
} from '../budgetForm';
import { BudgetStateCard } from '../components/BudgetStateCard';
import { CategorySelectionSheet } from '../components/CategorySelectionSheet';

interface BudgetFormScreenProps {
  budget?: BudgetDto | null;
  isError?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
}

export default function BudgetFormScreen({
  budget = null,
  isError = false,
  isLoading = false,
  onRetry,
}: Readonly<BudgetFormScreenProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    categories,
    isError: categoriesError,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();
  const {
    accounts,
    isError: accountsError,
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useAccounts();
  const { defaultCurrency } = useMobileUserPreferences();
  const { createBudgetMutation, updateBudgetMutation } = useBudgetMutations();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [colour, setColour] = useState('');
  const [icon, setIcon] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<BudgetFormErrors>({});
  const [saveError, setSaveError] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const initializedBudgetId = useRef<string | null>(null);
  const hasSelectedCurrency = useRef(false);

  const accountCurrencies = useMemo(
    () => [
      ...new Set(accounts.map((account) => account.currency.toUpperCase())),
    ],
    [accounts],
  );
  const allowedCurrencies = useMemo(
    () => getAllowedBudgetCurrencies(accountCurrencies, budget?.currency),
    [accountCurrencies, budget?.currency],
  );
  const currencyChoices = useMemo(
    () =>
      availableCurrencies.filter((item) =>
        allowedCurrencies.includes(item.code),
      ),
    [allowedCurrencies],
  );
  const colourChoices = [
    colors.accent.primary,
    colors.accent.bright,
    colors.accent.aqua,
    colors.support.primary,
    colors.neutral.darkGrey,
    colors.status.error,
  ];

  useEffect(() => {
    if (!budget || initializedBudgetId.current === budget.id) return;
    initializedBudgetId.current = budget.id;
    setName(budget.name);
    setAmount(String(budget.amount));
    setCurrency(budget.currency);
    setColour(budget.colour ?? '');
    setIcon(budget.icon ?? '');
    setCategoryIds(budget.categories);
  }, [budget]);

  useEffect(() => {
    if (budget || hasSelectedCurrency.current || accountCurrencies.length === 0)
      return;
    let selected = accountCurrencies[0];
    if (accountCurrencies.includes(defaultCurrency)) selected = defaultCurrency;
    setCurrency(selected);
  }, [accountCurrencies, budget, defaultCurrency]);

  const selectedCategoryNames = useMemo(
    () =>
      categories
        .filter((category) => categoryIds.includes(category.id))
        .map((category) => category.name),
    [categories, categoryIds],
  );
  let categorySelectionLabel = 'Select categories';
  if (selectedCategoryNames.length > 0) {
    categorySelectionLabel = selectedCategoryNames.join(', ');
  }
  const isPending =
    createBudgetMutation.isPending || updateBudgetMutation.isPending;
  const isReady =
    !accountsLoading &&
    !categoriesLoading &&
    !accountsError &&
    !categoriesError;

  function clearError(field: keyof BudgetFormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError(false);
  }

  async function submit() {
    if (isPending || !isReady) return;
    const result = validateBudgetForm(
      { name, currency, amount, colour, icon, categoryIds },
      allowedCurrencies,
    );
    setErrors(result.errors);
    if (!result.request) return;

    setSaveError(false);
    try {
      if (budget) {
        await updateBudgetMutation.mutateAsync({
          id: budget.id,
          request: result.request,
        });
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace(`/budgets/${budget.id}`);
        }
      } else {
        await createBudgetMutation.mutateAsync({ request: result.request });
        router.replace('/budgets');
      }
    } catch {
      setSaveError(true);
    }
  }

  if (isLoading) {
    return (
      <AppScreen headerTitle="Edit budget">
        <View
          accessibilityLabel="Loading budget form"
          style={[
            styles.loadingCard,
            {
              backgroundColor: colors.surface.background.secondary,
              borderRadius: borderRadius.lg,
              margin: spacing.md,
            },
          ]}
        />
      </AppScreen>
    );
  }

  if (isError) {
    let actionLabel: string | undefined;
    if (onRetry) actionLabel = 'Try again';
    return (
      <AppScreen headerTitle="Edit budget">
        <View style={{ padding: spacing.md }}>
          <BudgetStateCard
            actionLabel={actionLabel}
            body="The budget may have been deleted or is temporarily unavailable."
            onAction={onRetry}
            title="Couldn’t load this budget"
            variant="error"
          />
        </View>
      </AppScreen>
    );
  }

  let screenTitle = 'New budget';
  let heading = 'Create a budget';
  let description = 'Set a limit that applies every month.';
  let saveButtonLabel = 'Create budget';
  if (budget) {
    screenTitle = 'Edit budget';
    heading = 'Edit budget';
    description = 'Update your monthly spending limit.';
    saveButtonLabel = 'Save changes';
  }
  if (isPending) saveButtonLabel = 'Saving…';
  let keyboardBehavior: 'padding' | undefined;
  if (Platform.OS === 'ios') keyboardBehavior = 'padding';

  return (
    <AppScreen headerTitle={screenTitle}>
      <KeyboardAvoidingView behavior={keyboardBehavior} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { padding: spacing.md, paddingBottom: spacing.lg },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            accessibilityRole="header"
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.xl,
              fontWeight: '700',
            }}
          >
            {heading}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.sm,
              marginBottom: spacing.md,
            }}
          >
            {description}
          </Text>

          {saveError && (
            <Text
              accessibilityRole="alert"
              style={{
                backgroundColor: colors.surface.background.error,
                borderRadius: borderRadius.md,
                color: colors.status.error,
                fontSize: typography.sizes.sm,
                marginBottom: spacing.md,
                padding: spacing.sm,
              }}
            >
              Couldn’t save this budget. Your changes are still here. Try again.
            </Text>
          )}

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
              error={errors.name}
              label="Name *"
              onChangeText={(value) => {
                setName(value);
                clearError('name');
              }}
              placeholder="e.g. Groceries"
              value={name}
            />
            <CurrencyInput
              currencies={currencyChoices}
              description="Choose a currency used by one of your accounts."
              disabled={accountsLoading || accountsError}
              label="Currency *"
              onValueChanged={(selectedCurrency) => {
                hasSelectedCurrency.current = true;
                setCurrency(selectedCurrency ?? '');
                clearError('currency');
              }}
              value={currency}
            />
            <FormFieldError message={errors.currency} />
            {accountsError && (
              <RetryData
                onRetry={() => void refetchAccounts()}
                label="Couldn’t load account currencies"
              />
            )}
            <TextInput
              error={errors.amount}
              keyboardType="decimal-pad"
              label="Budget amount *"
              onChangeText={(value) => {
                setAmount(value);
                clearError('amount');
              }}
              placeholder="0.00"
              value={amount}
            />
            <Text
              style={[
                styles.fieldLabel,
                {
                  color: colors.text.primary,
                  fontSize: typography.sizes.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              Colour *
            </Text>
            <ColorPicker
              colors={colourChoices}
              onChange={(value) => {
                setColour(value);
                clearError('colour');
              }}
              value={colour || null}
            />
            <FormFieldError message={errors.colour} />
            <Text
              style={[
                styles.fieldLabel,
                {
                  color: colors.text.primary,
                  fontSize: typography.sizes.md,
                  marginBottom: spacing.xs,
                  marginTop: spacing.md,
                },
              ]}
            >
              Icon *
            </Text>
            <IconPicker
              onChange={(value) => {
                setIcon(value);
                clearError('icon');
              }}
              value={icon || null}
            />
            <FormFieldError message={errors.icon} />
            <View style={{ marginTop: spacing.md }}>
              <FieldButton
                disabled={categoriesLoading || categoriesError}
                label="Categories *"
                onPress={() => setShowCategories(true)}
                value={categorySelectionLabel}
              />
              <FormFieldError message={errors.categories} />
              {categoriesError && (
                <RetryData
                  onRetry={() => void refetchCategories()}
                  label="Couldn’t load categories"
                />
              )}
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface.background.primary,
              borderTopColor: colors.surface.border.primary,
              gap: spacing.sm,
              paddingBottom: Math.max(insets.bottom, spacing.md),
              paddingHorizontal: spacing.md,
              paddingTop: spacing.sm,
            },
          ]}
        >
          <Button
            disabled={isPending || !isReady}
            onClick={() => void submit()}
          >
            {saveButtonLabel}
          </Button>
          <Button
            disabled={isPending}
            onClick={() => router.back()}
            variant="outline"
          >
            Cancel
          </Button>
        </View>
      </KeyboardAvoidingView>

      <CategorySelectionSheet
        categories={categories}
        onApply={(ids) => {
          setCategoryIds(ids);
          clearError('categories');
        }}
        onDismiss={() => setShowCategories(false)}
        selectedIds={categoryIds}
        visible={showCategories}
      />
    </AppScreen>
  );
}

function FormFieldError({ message }: Readonly<{ message?: string }>) {
  const { colors, spacing, typography } = useTheme();
  if (!message) return null;
  return (
    <Text
      accessibilityRole="alert"
      style={{
        color: colors.status.error,
        fontSize: typography.sizes.sm,
        marginTop: spacing.xs,
      }}
    >
      {message}
    </Text>
  );
}

function RetryData({
  label,
  onRetry,
}: Readonly<{ label: string; onRetry: () => void }>) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onRetry}
      style={{ marginBottom: spacing.md }}
    >
      <Text
        style={{ color: colors.status.error, fontSize: typography.sizes.sm }}
      >
        {label}. <Text style={{ color: colors.accent.primary }}>Try again</Text>
      </Text>
    </Pressable>
  );
}

function FieldButton({
  disabled,
  label,
  onPress,
  value,
}: Readonly<{
  disabled?: boolean;
  label: string;
  onPress: () => void;
  value: string;
}>) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  return (
    <View>
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
        accessibilityLabel={`${label}, ${value}`}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.fieldButton,
          {
            backgroundColor: colors.surface.background.input,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            flex: 1,
          }}
        >
          {value}
        </Text>
        <ChevronRightIcon color={colors.text.secondary} size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  formCard: { borderWidth: 1, elevation: 1 },
  fieldLabel: { fontWeight: '500' },
  fieldButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 56,
  },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  loadingCard: { height: 460 },
});
