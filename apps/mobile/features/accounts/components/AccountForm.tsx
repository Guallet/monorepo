import {
  Button,
  KeyboardAwareScrollView,
  TextInput,
  useTheme,
} from '@guallet/luna-mobile';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccountMutations } from '@guallet/api-react';
import { AccountTypeIcon } from './AccountTypeIcon';
import { CurrencyInput } from '@/components/CurrencyInput';
import { ACCOUNT_TYPE_OPTIONS, getAccountTypeLabel } from '../models/account';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';

const accountFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter an account name.'),
  type: z.nativeEnum(AccountTypeDto),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{3}$/,
      'Use a three-letter currency code, such as GBP or EUR.',
    ),
  balance: z
    .string()
    .trim()
    .regex(/^-?\d+(?:[.,]\d+)?$/, 'Enter a valid balance.'),
});

interface AccountFormProps {
  account?: AccountDto | null;
  onCancel: () => void;
  onSaved: (account: AccountDto) => void;
}

export function AccountForm({
  account,
  onCancel,
  onSaved,
}: Readonly<AccountFormProps>) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const { defaultCurrency } = useMobileUserPreferences();
  const hasSelectedCurrency = useRef(Boolean(account));
  const { createAccountMutation, updateAccountMutation } =
    useAccountMutations();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      name: account?.name ?? '',
      type: account?.type ?? AccountTypeDto.CURRENT_ACCOUNT,
      currency: account?.currency ?? defaultCurrency,
      balance: account ? String(account.balance.amount) : '0',
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: accountFormSchema },
    listeners: { onChange: () => setError(null) },
    onSubmit: async ({ value }) => {
      const parsed = accountFormSchema.parse(value);
      const normalizedBalance = Number(parsed.balance.replace(',', '.'));
      setError(null);
      try {
        const savedAccount = account
          ? await updateAccountMutation.mutateAsync({
              id: account.id,
              request: {
                name: parsed.name,
                type: parsed.type,
                currency: parsed.currency,
                balance: normalizedBalance,
                create_balance_transaction: true,
              },
            })
          : await createAccountMutation.mutateAsync({
              request: {
                name: parsed.name,
                type: parsed.type,
                currency: parsed.currency,
                initial_balance: normalizedBalance,
                create_balance_transaction: true,
              },
            });
        onSaved(savedAccount);
      } catch {
        setError(
          `Couldn’t ${account ? 'update' : 'create'} this account. Please try again.`,
        );
      }
    },
  });

  useEffect(() => {
    if (!account) return;
    form.reset({
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: String(account.balance.amount),
    });
  }, [account, form]);

  useEffect(() => {
    if (!account && !hasSelectedCurrency.current) {
      form.setFieldValue('currency', defaultCurrency);
    }
  }, [account, defaultCurrency, form]);

  const isPending =
    createAccountMutation.isPending || updateAccountMutation.isPending;

  const values = useStore(form.store, (state) => state.values);

  return (
    <View style={styles.flex}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.content,
          { gap: spacing.lg, padding: spacing.md },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.xs }}>
          <Text
            style={[
              styles.introTitle,
              { color: colors.text.primary, fontSize: typography.sizes.xl },
            ]}
          >
            {account ? 'Update your account' : 'Add a manual account'}
          </Text>
          <Text
            style={[
              styles.introBody,
              { color: colors.text.secondary, fontSize: typography.sizes.sm },
            ]}
          >
            Keep your balance and account details up to date. You can edit these
            later.
          </Text>
        </View>

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
          <form.Field name="name">
            {(field) => (
              <TextInput
                autoCapitalize="words"
                label="Account name"
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                placeholder="e.g. Everyday current account"
                value={field.state.value}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
          <form.Field name="currency">
            {(field) => {
              const currencyError = field.state.meta.errors[0]?.message;
              return (
                <>
                  <CurrencyInput
                    onValueChanged={(selectedCurrency) => {
                      hasSelectedCurrency.current = true;
                      field.handleChange(selectedCurrency ?? '');
                      field.handleBlur();
                    }}
                    placeholder="Select a currency"
                    value={field.state.value}
                  />
                  {currencyError && (
                    <Text
                      accessibilityRole="alert"
                      style={{
                        color: colors.status.error,
                        fontSize: typography.sizes.sm,
                      }}
                    >
                      {currencyError}
                    </Text>
                  )}
                </>
              );
            }}
          </form.Field>
          <form.Field name="balance">
            {(field) => (
              <TextInput
                keyboardType={
                  Platform.OS === 'ios'
                    ? 'numbers-and-punctuation'
                    : 'decimal-pad'
                }
                label="Current balance"
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                placeholder="0.00"
                value={field.state.value}
                error={field.state.meta.errors[0]?.message}
                description="Use a negative value for money you owe."
              />
            )}
          </form.Field>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, fontSize: typography.sizes.lg },
            ]}
          >
            Account type
          </Text>
          <View style={[styles.typeGrid, { gap: spacing.sm }]}>
            {ACCOUNT_TYPE_OPTIONS.map((option) => {
              const selected = values.type === option.type;
              return (
                <Pressable
                  key={option.type}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => form.setFieldValue('type', option.type)}
                  style={({ pressed }) => [
                    styles.typeOption,
                    {
                      backgroundColor: selected
                        ? colors.button.secondary.default
                        : colors.surface.background.primary,
                      borderColor: selected
                        ? colors.accent.primary
                        : colors.surface.border.primary,
                      borderRadius: borderRadius.md,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <AccountTypeIcon
                    color={
                      selected ? colors.accent.primary : colors.text.secondary
                    }
                    size={18}
                    type={option.type}
                  />
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.typeLabel,
                      {
                        color: selected
                          ? colors.accent.primary
                          : colors.text.primary,
                        fontSize: typography.sizes.xs,
                      },
                    ]}
                  >
                    {getAccountTypeLabel(option.type)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error && (
          <Text
            style={[
              styles.error,
              { color: colors.status.error, fontSize: typography.sizes.sm },
            ]}
          >
            {error}
          </Text>
        )}

        <View style={[styles.actions, { gap: spacing.sm }]}>
          <Button
            disabled={isPending}
            onClick={onCancel}
            variant="outline"
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                disabled={!canSubmit || isSubmitting || isPending}
                onClick={() => {
                  if (!form.state.isSubmitting) void form.handleSubmit();
                }}
                style={styles.actionButton}
              >
                {isSubmitting || isPending
                  ? 'Saving…'
                  : account
                    ? 'Save changes'
                    : 'Add account'}
              </Button>
            )}
          </form.Subscribe>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 28 },
  introTitle: { fontWeight: '700' },
  introBody: { lineHeight: 21 },
  formCard: { borderWidth: 1 },
  sectionTitle: { fontWeight: '700' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  typeOption: {
    alignItems: 'center',
    borderWidth: 1,
    gap: 7,
    justifyContent: 'center',
    minHeight: 82,
    padding: 8,
    width: '31.5%',
  },
  typeLabel: { fontWeight: '600', textAlign: 'center' },
  error: { fontWeight: '500', textAlign: 'center' },
  actions: { flexDirection: 'row', marginTop: 'auto' },
  actionButton: { flex: 1 },
});
