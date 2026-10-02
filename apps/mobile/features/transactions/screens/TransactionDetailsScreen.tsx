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
import { CategoryPicker } from '@/components/category-picker/CategoryPicker';
import { SelectionSheet } from '@/components/ui/SelectionSheet';
import { formatTransactionDate } from '../utils';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { transaction, isLoading, isError, refetch } =
    useTransaction(transactionId);
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { dateFormat } = useMobileUserPreferences();
  const { updateTransactionMutation } = useTransactionMutations();
  const initializedId = useRef<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<'account' | null>(null);

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
    Alert.alert(
      t('Discard changes?'),
      t('Your unsaved changes will be lost.'),
      [
        { text: t('Keep editing'), style: 'cancel' },
        {
          text: t('Discard'),
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
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
      setError(t('Add a description for this transaction.'));
      return;
    }
    if (!form.accountId) {
      setError(t('Select an account.'));
      return;
    }
    if (!amountInput || !Number.isFinite(amount) || amount <= 0) {
      setError(t('Enter a valid amount.'));
      return;
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      setError(t('Currency must be a three-letter code, such as GBP.'));
      return;
    }
    if (!form.date) {
      setError(t('Select a transaction date.'));
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
      setError(t('We couldn’t save this transaction. Please try again.'));
    }
  }

  if (isError) {
    return (
      <AppScreen headerTitle={t('copy_bxixsl')}>
        <View style={styles.centerState}>
          <Label center>{t('copy_23tsiz')}</Label>
          <Button onClick={() => refetch()}>{t('copy_982hh6')}</Button>
          <Button variant="subtle" onClick={() => router.back()}>
            {t('copy_rcg61q')}
          </Button>
        </View>
      </AppScreen>
    );
  }

  if (!isLoading && !transaction) {
    return (
      <AppScreen headerTitle={t('copy_bxixsl')}>
        <View style={styles.centerState}>
          <Label center>{t('copy_1q8nlp4')}</Label>
          <Button onClick={() => router.back()}>{t('copy_rcg61q')}</Button>
        </View>
      </AppScreen>
    );
  }

  const accountName =
    accounts.find((account) => account.id === form?.accountId)?.name ??
    'Select an account';
  let loadingMessage: string | undefined;
  if (updateTransactionMutation.isPending) loadingMessage = 'Saving…';
  let keyboardBehavior: 'padding' | undefined;
  if (Platform.OS === 'ios') keyboardBehavior = 'padding';

  return (
    <AppScreen
      headerTitle={t('copy_bxixsl')}
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
                  {form.date
                    ? formatTransactionDate(form.date, dateFormat)
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
                  {form.description || 'Transaction'}
                </Text>
              </View>

              <View style={styles.typeRow}>
                <TypeButton
                  label={t('copy_q8z0xz')}
                  selected={form.type === 'expense'}
                  onPress={() => updateForm({ type: 'expense' })}
                />
                <TypeButton
                  label={t('copy_1hlgdxa')}
                  selected={form.type === 'income'}
                  onPress={() => updateForm({ type: 'income' })}
                />
              </View>

              <TextInput
                label={t('copy_sjj37t')}
                value={form.description}
                onChangeText={(description) => updateForm({ description })}
                placeholder={t('copy_1mt6lnz')}
                autoCapitalize="sentences"
              />
              <TextInput
                label={t('copy_a2ky21')}
                value={form.amount}
                onChangeText={(amount) => updateForm({ amount })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <FieldButton
                label={t('copy_oyp43g')}
                value={accountName}
                onPress={() => setSelection('account')}
              />
              <TextInput
                label={t('copy_5o3zh2')}
                value={form.currency}
                onChangeText={(currency) => updateForm({ currency })}
                placeholder={t('copy_1o6o4xg')}
                autoCapitalize="characters"
                maxLength={3}
              />
              <DateInput
                label={t('copy_ggjuyh')}
                value={form.date}
                maxDate={new Date()}
                onChange={(date) => updateForm({ date })}
                formatValue={(date) => formatTransactionDate(date, dateFormat)}
                error={form.date ? undefined : 'Select a transaction date.'}
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
                  {t('copy_1cr1mz5')}
                </Text>
                <CategoryPicker
                  allowClear
                  categories={categories}
                  clearLabel={t('copy_1opu1wi')}
                  onChange={(categoryId) => updateForm({ categoryId })}
                  placeholder={t('copy_1opu1wi')}
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
                  value={form.categoryId}
                />
              </View>
              <TextInput
                label={t('copy_4f76ga')}
                value={form.notes}
                onChangeText={(notes) => updateForm({ notes })}
                placeholder={t('copy_80sifx')}
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
                {t('copy_r69b3t')}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                {t('copy_ew9em3')}
              </Button>
            </Stack>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <SelectionSheet
        visible={selection === 'account'}
        title={t('copy_18a7ilu')}
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
