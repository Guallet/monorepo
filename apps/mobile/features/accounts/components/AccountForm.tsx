import { revalidateLogic, useForm, useSelector } from '@tanstack/react-form';
import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { useAccountMutations, useInstitutions } from '@guallet/api-react';
import {
  BottomSheet,
  Button,
  KeyboardAwareScrollView,
  TextInput,
  useTheme,
} from '@guallet/luna-mobile';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CurrencyInput } from '@/components/CurrencyInput';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { ACCOUNT_TYPE_OPTIONS, getAccountTypeLabel } from '../models/account';
import { accountFormSchema } from '../models/accountForm';
import { AccountTypeIcon } from './AccountTypeIcon';

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
  const { createAccountMutation, updateAccountMutation } =
    useAccountMutations();
  const institutionsQuery = useInstitutions({ enabled: Boolean(account) });
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      name: account?.name ?? '',
      type: account?.type ?? AccountTypeDto.CURRENT_ACCOUNT,
      currency: account?.currency ?? defaultCurrency,
      balance: account ? String(account.balance.amount) : '0',
      institutionId: account?.institutionId ?? null,
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: accountFormSchema },
    listeners: { onChange: () => setError(null) },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const normalizedCurrency = value.currency.trim().toUpperCase();
        const parsedBalance = Number(value.balance.trim().replace(',', '.'));
        const savedAccount = account
          ? await updateAccountMutation.mutateAsync({
              id: account.id,
              request: {
                name: value.name.trim(),
                type: value.type,
                currency: normalizedCurrency,
                balance: parsedBalance,
                create_balance_transaction: true,
                institution_id: value.institutionId,
              },
            })
          : await createAccountMutation.mutateAsync({
              request: {
                name: value.name.trim(),
                type: value.type,
                currency: normalizedCurrency,
                initial_balance: parsedBalance,
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
  const institutionId = useSelector(
    form.store,
    (state) => state.values.institutionId,
  );
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  const isPending =
    isSubmitting ||
    createAccountMutation.isPending ||
    updateAccountMutation.isPending;
  const institutions = [...institutionsQuery.institutions].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  useEffect(() => {
    if (!account && !form.getFieldMeta('currency')?.isTouched) {
      form.setFieldValue('currency', defaultCurrency);
    }
  }, [account, defaultCurrency, form]);

  function selectInstitution(id: string | null) {
    form.setFieldValue('institutionId', id);
    setError(null);
    setShowInstitutionPicker(false);
  }
  async function submitForm() {
    if (form.state.isSubmitting) return;
    await form.handleSubmit();
  }

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
              gap: spacing.md,
              padding: spacing.md,
            },
          ]}
        >
          <form.Field name="name">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <TextInput
                  accessibilityLabel="Account name, required"
                  accessibilityHint={error}
                  autoCapitalize="words"
                  disabled={isPending}
                  label="Account name"
                  onSubmitEditing={() => void submitForm()}
                  placeholder="e.g. Everyday current account"
                  returnKeyType="next"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={error}
                />
              );
            }}
          </form.Field>
          {account && (
            <form.Field name="institutionId">
              {(field) => {
                let label = 'No institution';
                if (field.state.value) {
                  label =
                    institutions.find(
                      (institution) => institution.id === field.state.value,
                    )?.name ?? 'Current institution';
                }
                return (
                  <View style={{ gap: spacing.xs }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.sm,
                        fontWeight: '600',
                      }}
                    >
                      Institution
                    </Text>
                    <Button
                      accessibilityLabel={`Institution: ${label}`}
                      accessibilityHint="Choose another institution or remove the institution from this account."
                      disabled={isPending}
                      onClick={() => setShowInstitutionPicker(true)}
                      variant="outline"
                    >
                      {label}
                    </Button>
                  </View>
                );
              }}
            </form.Field>
          )}
          <form.Field name="currency">
            {(field) => {
              const validationError = field.state.meta.errors[0]?.message;
              return (
                <View style={{ gap: spacing.xs }}>
                  <CurrencyInput
                    disabled={isPending}
                    onValueChanged={(value) => {
                      field.handleChange(value ?? '');
                      field.handleBlur();
                    }}
                    placeholder="Select a currency"
                    value={field.state.value}
                  />
                  {validationError && (
                    <Text
                      accessibilityRole="alert"
                      style={{ color: colors.status.error }}
                    >
                      {validationError}
                    </Text>
                  )}
                </View>
              );
            }}
          </form.Field>
          <form.Field name="balance">
            {(field) => {
              const error = field.state.meta.errors[0]?.message;
              return (
                <TextInput
                  accessibilityLabel="Current balance, required"
                  accessibilityHint={
                    error ?? 'Use a negative value for money you owe.'
                  }
                  description="Use a negative value for money you owe."
                  disabled={isPending}
                  keyboardType={
                    Platform.OS === 'ios'
                      ? 'numbers-and-punctuation'
                      : 'decimal-pad'
                  }
                  label="Current balance"
                  onSubmitEditing={() => void submitForm()}
                  placeholder="0.00"
                  returnKeyType="done"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={error}
                />
              );
            }}
          </form.Field>
        </View>

        <form.Field name="type">
          {(field) => {
            const validationError = field.state.meta.errors[0]?.message;
            return (
              <View style={{ gap: spacing.sm }}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text.primary,
                      fontSize: typography.sizes.lg,
                    },
                  ]}
                >
                  Account type
                </Text>
                <View style={[styles.typeGrid, { gap: spacing.sm }]}>
                  {ACCOUNT_TYPE_OPTIONS.map((option) => {
                    const selected = field.state.value === option.type;
                    return (
                      <Pressable
                        key={option.type}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        disabled={isPending}
                        onPress={() => {
                          field.handleChange(option.type);
                          field.handleBlur();
                        }}
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
                            selected
                              ? colors.accent.primary
                              : colors.text.secondary
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
                {validationError && (
                  <Text
                    accessibilityRole="alert"
                    style={{ color: colors.status.error }}
                  >
                    {validationError}
                  </Text>
                )}
              </View>
            );
          }}
        </form.Field>

        {error && (
          <Text
            accessibilityRole="alert"
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
            style={styles.actionButton}
            variant="outline"
          >
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, submitting]) => (
              <Button
                disabled={!canSubmit || isPending || submitting}
                onClick={() => void submitForm()}
                style={styles.actionButton}
              >
                {submitting
                  ? 'Saving…'
                  : account
                    ? 'Save changes'
                    : 'Add account'}
              </Button>
            )}
          </form.Subscribe>
        </View>
      </KeyboardAwareScrollView>
      {account && (
        <BottomSheet
          isOpen={showInstitutionPicker}
          title="Choose an institution"
          showCloseIcon
          snapPoints={['half', 'full']}
          onClose={() => setShowInstitutionPicker(false)}
        >
          <>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: institutionId === null }}
              disabled={isPending}
              onPress={() => selectInstitution(null)}
              style={[
                styles.institutionOption,
                { borderColor: colors.surface.border.primary },
              ]}
            >
              <Text style={{ color: colors.text.primary }}>No institution</Text>
              {institutionId === null && (
                <Text style={{ color: colors.accent.primary }}>Selected</Text>
              )}
            </Pressable>
            <FlatList
              data={institutions}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text
                  style={{
                    color: colors.text.secondary,
                    padding: spacing.md,
                    textAlign: 'center',
                  }}
                >
                  {institutionsQuery.isLoading
                    ? 'Loading institutions…'
                    : 'No institutions available'}
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: institutionId === item.id,
                  }}
                  accessibilityLabel={item.name}
                  disabled={isPending}
                  onPress={() => selectInstitution(item.id)}
                  style={[
                    styles.institutionOption,
                    { borderColor: colors.surface.border.primary },
                  ]}
                >
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Text style={{ color: colors.text.primary }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.text.secondary }}>
                      {item.user_id === null ? 'Shared' : 'Custom'}
                    </Text>
                  </View>
                  {institutionId === item.id && (
                    <Text style={{ color: colors.accent.primary }}>
                      Selected
                    </Text>
                  )}
                </Pressable>
              )}
              style={{ flex: 1 }}
            />
            {institutionsQuery.isError && (
              <Button
                onClick={() => void institutionsQuery.refetch()}
                variant="outline"
              >
                Retry loading institutions
              </Button>
            )}
          </>
        </BottomSheet>
      )}
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
  institutionOption: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 8,
  },
  typeLabel: { fontWeight: '600', textAlign: 'center' },
  error: { fontWeight: '500', textAlign: 'center' },
  actions: { flexDirection: 'row', marginTop: 'auto' },
  actionButton: { flex: 1 },
});
