import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { CategoryIcon, ChevronRightIcon } from '@guallet/luna-mobile/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { CurrencyInput } from '@/components/CurrencyInput';
import { availableCurrencies } from '@/components/currencyPickerData';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { fieldError, SubmitButton, submitForm } from '@/components/forms';
import { getAllowedBudgetCurrencies, validateBudgetForm } from '../budgetForm';
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
  const budgetSchema = useMemo(
    () =>
      z
        .object({
          name: z.string(),
          currency: z.string(),
          amount: z.string(),
          colour: z.string(),
          icon: z.string(),
          categoryIds: z.array(z.string()),
        })
        .superRefine((values, context) => {
          const result = validateBudgetForm(values, allowedCurrencies);
          for (const [key, message] of Object.entries(result.errors)) {
            if (!message) continue;
            const path = key === 'categories' ? 'categoryIds' : key;
            context.addIssue({
              code: 'custom',
              path: [path],
              message,
            });
          }
        }),
    [allowedCurrencies],
  );
  const form = useForm({
    defaultValues: {
      name: '',
      amount: '',
      currency: '',
      colour: '',
      icon: '',
      categoryIds: [] as string[],
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: budgetSchema },
    listeners: { onChange: () => setSaveError(false) },
    onSubmit: async ({ value }) => {
      const result = validateBudgetForm(value, allowedCurrencies);
      if (!result.request) return;
      setSaveError(false);
      try {
        if (budget) {
          await updateBudgetMutation.mutateAsync({
            id: budget.id,
            request: result.request,
          });
          if (router.canGoBack()) router.back();
          else router.replace(`/budgets/${budget.id}`);
        } else {
          await createBudgetMutation.mutateAsync({ request: result.request });
          router.replace('/budgets');
        }
      } catch {
        setSaveError(true);
      }
    },
  });
  const values = useStore(form.store, (state) => state.values);
  const errors = {
    name: fieldError(form.getFieldMeta('name')?.errors ?? []),
    currency: fieldError(form.getFieldMeta('currency')?.errors ?? []),
    amount: fieldError(form.getFieldMeta('amount')?.errors ?? []),
    colour: fieldError(form.getFieldMeta('colour')?.errors ?? []),
    icon: fieldError(form.getFieldMeta('icon')?.errors ?? []),
    categories: fieldError(form.getFieldMeta('categoryIds')?.errors ?? []),
  };
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
    form.reset({
      name: budget.name,
      amount: String(budget.amount),
      currency: budget.currency,
      colour: budget.colour ?? '',
      icon: budget.icon ?? '',
      categoryIds: budget.categories,
    });
  }, [budget, form]);

  useEffect(() => {
    if (budget || hasSelectedCurrency.current || accountCurrencies.length === 0)
      return;
    let selected = accountCurrencies[0];
    if (accountCurrencies.includes(defaultCurrency)) selected = defaultCurrency;
    form.setFieldValue('currency', selected);
  }, [accountCurrencies, budget, defaultCurrency, form]);

  const selectedCategories = useMemo(
    () =>
      categories.filter((category) => values.categoryIds.includes(category.id)),
    [categories, values.categoryIds],
  );
  const selectedCategory =
    selectedCategories.length === 1 ? selectedCategories[0] : undefined;
  const categorySelectionLabel =
    selectedCategories.length > 1
      ? `${selectedCategories.length} categories selected`
      : (selectedCategory?.name ?? 'Select categories');
  const isPending =
    createBudgetMutation.isPending || updateBudgetMutation.isPending;
  const isReady =
    !accountsLoading &&
    !categoriesLoading &&
    !accountsError &&
    !categoriesError;

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
              onChangeText={(value) => form.setFieldValue('name', value)}
              placeholder="e.g. Groceries"
              value={values.name}
            />
            <CurrencyInput
              currencies={currencyChoices}
              description="Choose a currency used by one of your accounts."
              disabled={accountsLoading || accountsError}
              label="Currency *"
              onValueChanged={(selectedCurrency) => {
                hasSelectedCurrency.current = true;
                form.setFieldValue('currency', selectedCurrency ?? '');
              }}
              value={values.currency}
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
              onChangeText={(value) => form.setFieldValue('amount', value)}
              placeholder="0.00"
              value={values.amount}
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
              onChange={(value) => form.setFieldValue('colour', value)}
              value={values.colour || null}
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
              onChange={(value) => form.setFieldValue('icon', value)}
              value={values.icon || null}
            />
            <FormFieldError message={errors.icon} />
            <View style={{ marginTop: spacing.md }}>
              <FieldButton
                disabled={categoriesLoading || categoriesError}
                label="Categories *"
                leftSection={
                  selectedCategory && (
                    <CategoryIcon
                      name={selectedCategory.icon}
                      color={selectedCategory.colour ?? colors.text.primary}
                      size={spacing.lg}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    />
                  )
                }
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
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <SubmitButton
                canSubmit={canSubmit}
                disabled={!isReady}
                isSubmitting={isSubmitting || isPending}
                onSubmit={() => void submitForm(form)}
                submittingLabel="Saving…"
              >
                {saveButtonLabel}
              </SubmitButton>
            )}
          </form.Subscribe>
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
          form.setFieldValue('categoryIds', ids);
        }}
        onDismiss={() => setShowCategories(false)}
        selectedIds={values.categoryIds}
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
  leftSection,
  onPress,
  value,
}: Readonly<{
  disabled?: boolean;
  label: string;
  leftSection?: ReactNode;
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
        {leftSection}
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
