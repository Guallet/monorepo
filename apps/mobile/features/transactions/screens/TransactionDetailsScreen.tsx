import { Ionicons } from '@expo/vector-icons';
import {
  useAccounts,
  useCategories,
  useTransaction,
  useTransactionMutations,
} from '@guallet/api-react';
import { UpdateTransactionRequest } from '@guallet/api-client';
import { ISO4217Currencies } from '@guallet/money';
import {
  Button,
  DateInput,
  Label,
  Stack,
  TextInput,
  useAlert,
  useTheme,
} from '@guallet/luna-mobile';
import { useRouter } from 'expo-router';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { CategoryPicker } from '@/components/category-picker/CategoryPicker';
import { SelectionSheet } from '@/components/ui/SelectionSheet';
import { formatTransactionDate } from '../utils';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';

type FormState = {
  type: 'expense' | 'income';
  accountId: string;
  description: string;
  notes: string;
  amount: string;
  currency: string;
  date: Date;
  categoryId: string | null;
};

const transactionFormSchema = z.object({
  type: z.enum(['expense', 'income']),
  accountId: z.string().min(1, 'Select an account.'),
  description: z
    .string()
    .trim()
    .min(1, 'Add a description for this transaction.'),
  notes: z.string(),
  amount: z
    .string()
    .regex(/^\d+(?:[.,]\d+)?$/, 'Enter a valid amount above zero.')
    .refine(
      (amount) => Number(amount.replace(',', '.')) > 0,
      'Enter a valid amount above zero.',
    ),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (currency) => Boolean(ISO4217Currencies[currency]),
      'Choose a supported currency code, such as GBP.',
    ),
  date: z.date(),
  categoryId: z.string().nullable(),
});

interface TransactionDetailsScreenProps {
  transactionId: string;
}

export function TransactionDetailsScreen({
  transactionId,
}: Readonly<TransactionDetailsScreenProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const router = useRouter();
  const showAlert = useAlert();
  const navigation = useNavigation();
  const { transaction, isLoading, isError, refetch } =
    useTransaction(transactionId);
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { dateFormat, defaultCurrency } = useMobileUserPreferences();
  const { updateTransactionMutation } = useTransactionMutations();
  const initializedId = useRef<string | null>(null);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<'account' | null>(null);

  const tanstackForm = useForm({
    defaultValues: {
      type: 'expense' as FormState['type'],
      accountId: '',
      description: '',
      notes: '',
      amount: '',
      currency: defaultCurrency,
      date: new Date(),
      categoryId: null as string | null,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: transactionFormSchema,
    },
    listeners: { onChange: () => setError(null) },
    onSubmit: async ({ value }) => {
      const amount = Number(value.amount.trim().replace(',', '.'));
      const request: UpdateTransactionRequest = {
        accountId: value.accountId,
        description: value.description.trim(),
        notes: value.notes.trim() || null,
        amount: value.type === 'income' ? amount : -amount,
        currency: value.currency.trim().toUpperCase(),
        date: value.date,
        categoryId: value.categoryId,
      };
      Keyboard.dismiss();
      setError(null);
      try {
        await updateTransactionMutation.mutateAsync({
          id: transactionId,
          request,
        });
        router.back();
      } catch {
        setError('We couldn’t save this transaction. Please try again.');
      }
    },
  });
  const values = useStore(tanstackForm.store, (state) => state.values);
  const fieldMeta = useStore(tanstackForm.store, (state) => state.fieldMeta);

  useEffect(() => {
    if (!transaction || initializedId.current === transaction.id) return;

    let transactionType: FormState['type'] = 'expense';
    if (transaction.amount >= 0) transactionType = 'income';

    const nextForm: FormState = {
      type: transactionType,
      accountId: transaction.accountId,
      description: transaction.description,
      notes: transaction.notes ?? '',
      amount: Math.abs(transaction.amount).toString(),
      currency: transaction.currency || defaultCurrency,
      date: new Date(transaction.date),
      categoryId: transaction.categoryId,
    };
    tanstackForm.reset(nextForm);
    setInitialForm(nextForm);
    initializedId.current = transaction.id;
  }, [transaction, defaultCurrency, tanstackForm]);

  const isDirty =
    initialForm !== null &&
    JSON.stringify(values) !== JSON.stringify(initialForm);

  usePreventRemove(isDirty, ({ data }) => {
    showAlert({
      title: 'Discard changes?',
      message: 'Your unsaved changes will be lost.',
      actions: [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    });
  });

  if (isError) {
    return (
      <AppScreen headerTitle="Edit transaction">
        <View style={styles.centerState}>
          <Label center>We couldn’t load this transaction.</Label>
          <Button onClick={() => refetch()}>Try again</Button>
          <Button variant="subtle" onClick={() => router.back()}>
            Go back
          </Button>
        </View>
      </AppScreen>
    );
  }

  if (!isLoading && !transaction) {
    return (
      <AppScreen headerTitle="Edit transaction">
        <View style={styles.centerState}>
          <Label center>Transaction not found.</Label>
          <Button onClick={() => router.back()}>Go back</Button>
        </View>
      </AppScreen>
    );
  }

  const accountName =
    accounts.find((account) => account.id === values.accountId)?.name ??
    'Select an account';
  let loadingMessage: string | undefined;
  if (updateTransactionMutation.isPending) loadingMessage = 'Saving…';
  let keyboardBehavior: 'padding' | undefined;
  if (Platform.OS === 'ios') keyboardBehavior = 'padding';

  return (
    <AppScreen
      headerTitle="Edit transaction"
      isLoading={isLoading || updateTransactionMutation.isPending}
      loadingMessage={loadingMessage}
      headerOptions={{
        headerBackVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
        ),
      }}
    >
      {transaction && !isLoading && (
        <KeyboardAvoidingView style={styles.flex} behavior={keyboardBehavior}>
          <ScrollView
            contentContainerStyle={{
              padding: spacing.md,
              paddingBottom: spacing.xl,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Stack gap={spacing.md}>
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: colors.surface.background.primary,
                    borderColor: colors.surface.border.primary,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.xs,
                  }}
                >
                  {values.date
                    ? formatTransactionDate(values.date, dateFormat)
                    : 'Select date'}
                </Text>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.lg,
                    fontWeight: '700',
                  }}
                  numberOfLines={2}
                >
                  {values.description || 'Transaction'}
                </Text>
              </View>

              <View style={styles.typeRow}>
                <TypeButton
                  label="Expense"
                  selected={values.type === 'expense'}
                  onPress={() => tanstackForm.setFieldValue('type', 'expense')}
                />
                <TypeButton
                  label="Income"
                  selected={values.type === 'income'}
                  onPress={() => tanstackForm.setFieldValue('type', 'income')}
                />
              </View>

              <TextInput
                label="Description"
                value={values.description}
                onChangeText={(description) =>
                  tanstackForm.setFieldValue('description', description)
                }
                placeholder="Enter transaction description"
                autoCapitalize="sentences"
                error={fieldMeta.description?.errors[0]?.message}
              />
              <TextInput
                label="Amount"
                value={values.amount}
                onChangeText={(amount) =>
                  tanstackForm.setFieldValue('amount', amount)
                }
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={fieldMeta.amount?.errors[0]?.message}
              />

              <FieldButton
                label="Account"
                value={accountName}
                onPress={() => setSelection('account')}
              />
              {fieldMeta.accountId?.errors[0]?.message && (
                <Text
                  accessibilityRole="alert"
                  style={{ color: colors.status.error }}
                >
                  {fieldMeta.accountId?.errors[0]?.message}
                </Text>
              )}
              <tanstackForm.Field name="currency">
                {(field) => (
                  <TextInput
                    label="Currency"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    placeholder={defaultCurrency}
                    autoCapitalize="characters"
                    maxLength={3}
                    error={field.state.meta.errors[0]?.message}
                  />
                )}
              </tanstackForm.Field>
              <DateInput
                label="Date"
                value={values.date}
                maxDate={new Date()}
                onChange={(date) => {
                  if (date) tanstackForm.setFieldValue('date', date);
                }}
                formatValue={(date) => formatTransactionDate(date, dateFormat)}
                error={fieldMeta.date?.errors[0]?.message}
              />
              <View>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.md,
                    fontWeight: '500',
                    marginBottom: spacing.xs,
                  }}
                >
                  Category
                </Text>
                <CategoryPicker
                  allowClear
                  categories={categories}
                  clearLabel="Uncategorised"
                  onChange={(categoryId) =>
                    tanstackForm.setFieldValue('categoryId', categoryId)
                  }
                  placeholder="Uncategorised"
                  selectionMode="single"
                  style={[
                    styles.field,
                    {
                      backgroundColor: colors.surface.background.input,
                      borderColor: colors.surface.border.input,
                      borderRadius: borderRadius.lg,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                  value={values.categoryId}
                />
              </View>
              <TextInput
                label="Notes"
                value={values.notes}
                onChangeText={(notes) =>
                  tanstackForm.setFieldValue('notes', notes)
                }
                placeholder="Add a note"
                multiline
                numberOfLines={4}
                style={styles.notesInput}
                textAlignVertical="top"
              />

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

              <tanstackForm.Subscribe
                selector={(state) =>
                  [state.canSubmit, state.isSubmitting] as const
                }
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    disabled={
                      !canSubmit ||
                      !isDirty ||
                      isSubmitting ||
                      updateTransactionMutation.isPending
                    }
                    onClick={() => {
                      if (!tanstackForm.state.isSubmitting)
                        void tanstackForm.handleSubmit();
                    }}
                  >
                    {isSubmitting || updateTransactionMutation.isPending
                      ? 'Saving…'
                      : 'Save changes'}
                  </Button>
                )}
              </tanstackForm.Subscribe>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </Stack>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <SelectionSheet
        visible={selection === 'account'}
        title="Select account"
        options={accounts.map((account) => ({
          id: account.id,
          label: account.name,
        }))}
        selectedId={values.accountId || null}
        onClose={() => setSelection(null)}
        onSelect={(accountId) => {
          if (accountId) tanstackForm.setFieldValue('accountId', accountId);
        }}
      />
    </AppScreen>
  );
}

function TypeButton({
  label,
  selected,
  onPress,
}: Readonly<{
  label: string;
  selected: boolean;
  onPress: () => void;
}>) {
  let variant: 'filled' | 'outline' = 'outline';
  if (selected) variant = 'filled';

  return (
    <Button
      variant={variant}
      selected={selected}
      onClick={onPress}
      style={styles.typeButton}
    >
      {label}
    </Button>
  );
}

function FieldButton({
  label,
  value,
  onPress,
}: Readonly<{
  label: string;
  value: string;
  onPress: () => void;
}>) {
  const { colors, spacing, typography, borderRadius } = useTheme();

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
        onPress={onPress}
        style={({ pressed }) => {
          let opacity = 1;
          if (pressed) opacity = 0.7;

          return [
            styles.field,
            {
              backgroundColor: colors.surface.background.input,
              borderColor: colors.surface.border.input,
              borderRadius: borderRadius.lg,
              opacity,
              paddingHorizontal: spacing.md,
            },
          ];
        }}
      >
        <Text
          style={{ color: colors.text.primary, fontSize: typography.sizes.md }}
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.lg,
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
  summaryCard: {
    borderWidth: 1,
    gap: 6,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  field: {
    minHeight: 56,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notesInput: {
    minHeight: 112,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});
