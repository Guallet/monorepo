import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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
  Label,
  Stack,
  TextInput,
  useTheme,
} from '@guallet/luna-mobile';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
  date: Date;
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!transaction || initializedId.current === transaction.id) return;

    const nextForm: FormState = {
      type: transaction.amount >= 0 ? 'income' : 'expense',
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

  function goBack() {
    if (!isDirty) {
      router.back();
      return;
    }

    Alert.alert('Discard changes?', 'Your unsaved changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  }

  function updateForm(values: Partial<FormState>) {
    setForm((current) => (current ? { ...current, ...values } : current));
    setError(null);
  }

  function handleDateChange(event: DateTimePickerEvent, date?: Date) {
    setShowDatePicker(false);
    if (event.type === 'set' && date) {
      updateForm({ date });
    }
  }

  async function save() {
    if (!form) return;

    const amount = Number(form.amount);
    const currency = form.currency.trim().toUpperCase();

    if (!form.description.trim()) {
      setError('Add a description for this transaction.');
      return;
    }
    if (!form.accountId) {
      setError('Select an account.');
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      setError('Currency must be a three-letter code, such as GBP.');
      return;
    }

    const request: UpdateTransactionRequest = {
      accountId: form.accountId,
      description: form.description.trim(),
      notes: form.notes.trim() || null,
      amount: form.type === 'income' ? amount : -amount,
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

  return (
    <AppScreen
      headerTitle="Edit transaction"
      isLoading={isLoading || updateTransactionMutation.isPending}
      loadingMessage={
        updateTransactionMutation.isPending ? 'Saving…' : undefined
      }
      headerOptions={{
        headerBackVisible: false,
        headerLeft: () => (
          <Pressable onPress={goBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
        ),
      }}
    >
      {form && (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
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
                  {formatTransactionDate(form.date)}
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
              <FieldButton
                label="Date"
                value={formatTransactionDate(form.date)}
                onPress={() => setShowDatePicker(true)}
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
              <Button variant="outline" onClick={goBack}>
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
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.dateModalBackdrop}>
          <Pressable
            style={styles.dismissArea}
            onPress={() => setShowDatePicker(false)}
          />
          <View
            style={[
              styles.dateModal,
              {
                backgroundColor: colors.surface.background.primary,
                borderTopLeftRadius: borderRadius.xl,
                borderTopRightRadius: borderRadius.xl,
                padding: spacing.lg,
              },
            ]}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.lg,
                fontWeight: '700',
              }}
            >
              Select date
            </Text>
            <DateTimePicker
              value={form?.date ?? new Date()}
              mode="date"
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
            <Button variant="subtle" onClick={() => setShowDatePicker(false)}>
              Done
            </Button>
          </View>
        </View>
      </Modal>
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
  return (
    <Button
      variant={selected ? 'filled' : 'outline'}
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
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: colors.surface.background.input,
            borderColor: colors.surface.border.input,
            borderRadius: borderRadius.lg,
            opacity: pressed ? 0.7 : 1,
            paddingHorizontal: spacing.md,
          },
        ]}
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
  dateModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  dismissArea: {
    flex: 1,
  },
  dateModal: {
    gap: 12,
  },
});
