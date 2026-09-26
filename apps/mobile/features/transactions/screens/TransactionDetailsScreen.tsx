import { Ionicons } from '@expo/vector-icons';
import {
  useAccounts,
  useCategories,
  useTransaction,
  useTransactionMutations,
} from '@guallet/api-react';
import { UpdateTransactionRequest } from '@guallet/api-client';
import {
  Button,
  DateInput,
  Label,
  Stack,
  TextInput,
  useTheme,
} from '@guallet/luna-mobile';
import { useRouter } from 'expo-router';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { SelectionSheet } from '../components/SelectionSheet';
import { formatTransactionDate } from '../utils';

type FormState = {
  type: 'expense' | 'income';
  accountId: string;
  description: string;
  notes: string;
  amount: string;
  currency: string;
  date: Date | null;
  categoryId: string | null;
};

interface TransactionDetailsScreenProps {
  transactionId: string;
}

export function TransactionDetailsScreen({
  transactionId,
}: Readonly<TransactionDetailsScreenProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { transaction, isLoading, isError, refetch } =
    useTransaction(transactionId);
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { updateTransactionMutation } = useTransactionMutations();
  const initializedId = useRef<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<'account' | 'category' | null>(
    null,
  );

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
      currency: transaction.currency,
      date: new Date(transaction.date),
      categoryId: transaction.categoryId,
    };
    setForm(nextForm);
    setInitialForm(nextForm);
    initializedId.current = transaction.id;
  }, [transaction]);

  const isDirty =
    form !== null &&
    initialForm !== null &&
    JSON.stringify(form) !== JSON.stringify(initialForm);

  usePreventRemove(isDirty, ({ data }) => {
    Alert.alert('Discard changes?', 'Your unsaved changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  function updateForm(values: Partial<FormState>) {
    setForm((current) => {
      if (!current) return current;
      return { ...current, ...values };
    });
    setError(null);
  }

  async function save() {
    if (!form) return;

    const amountInput = form.amount.trim();
    const amount = Number(amountInput);
    const currency = form.currency.trim().toUpperCase();

    if (!form.description.trim()) {
      setError('Add a description for this transaction.');
      return;
    }
    if (!form.accountId) {
      setError('Select an account.');
      return;
    }
    if (!amountInput || !Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      setError('Currency must be a three-letter code, such as GBP.');
      return;
    }
    if (!form.date) {
      setError('Select a transaction date.');
      return;
    }

    let signedAmount = -amount;
    if (form.type === 'income') signedAmount = amount;

    const request: UpdateTransactionRequest = {
      accountId: form.accountId,
      description: form.description.trim(),
      notes: form.notes.trim() || null,
      amount: signedAmount,
      currency,
      date: form.date,
      categoryId: form.categoryId,
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
  }

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
    accounts.find((account) => account.id === form?.accountId)?.name ??
    'Select an account';
  const categoryName =
    categories.find((category) => category.id === form?.categoryId)?.name ??
    'Uncategorised';
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
      {form && (
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
                  {form.date ? formatTransactionDate(form.date) : 'Select date'}
                </Text>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.lg,
                    fontWeight: '700',
                  }}
                  numberOfLines={2}
                >
                  {form.description || 'Transaction'}
                </Text>
              </View>

              <View style={styles.typeRow}>
                <TypeButton
                  label="Expense"
                  selected={form.type === 'expense'}
                  onPress={() => updateForm({ type: 'expense' })}
                />
                <TypeButton
                  label="Income"
                  selected={form.type === 'income'}
                  onPress={() => updateForm({ type: 'income' })}
                />
              </View>

              <TextInput
                label="Description"
                value={form.description}
                onChangeText={(description) => updateForm({ description })}
                placeholder="Enter transaction description"
                autoCapitalize="sentences"
              />
              <TextInput
                label="Amount"
                value={form.amount}
                onChangeText={(amount) => updateForm({ amount })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <FieldButton
                label="Account"
                value={accountName}
                onPress={() => setSelection('account')}
              />
              <TextInput
                label="Currency"
                value={form.currency}
                onChangeText={(currency) => updateForm({ currency })}
                placeholder="GBP"
                autoCapitalize="characters"
                maxLength={3}
              />
              <DateInput
                label="Date"
                value={form.date}
                maxDate={new Date()}
                onChange={(date) => updateForm({ date })}
                error={form.date ? undefined : 'Select a transaction date.'}
              />
              <FieldButton
                label="Category"
                value={categoryName}
                onPress={() => setSelection('category')}
              />
              <TextInput
                label="Notes"
                value={form.notes}
                onChangeText={(notes) => updateForm({ notes })}
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

              <Button
                onClick={save}
                disabled={updateTransactionMutation.isPending}
              >
                Save changes
              </Button>
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
        selectedId={form?.accountId ?? null}
        onClose={() => setSelection(null)}
        onSelect={(accountId) => {
          if (accountId) updateForm({ accountId });
        }}
      />
      <SelectionSheet
        visible={selection === 'category'}
        title="Select category"
        options={categories.map((category) => ({
          id: category.id,
          label: category.name,
        }))}
        selectedId={form?.categoryId ?? null}
        allowNone
        noneLabel="Uncategorised"
        onClose={() => setSelection(null)}
        onSelect={(categoryId) => updateForm({ categoryId })}
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
