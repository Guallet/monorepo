import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { SavingGoalDto } from '@guallet/api-client';
import { useAccounts, useSavingGoalMutations } from '@guallet/api-react';
import { Button, useTheme } from '@guallet/luna-mobile';
import { GoalAccountsSheet } from './GoalAccountsSheet';
import { validateGoal } from '../models/savingGoal';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { useTranslation } from 'react-i18next';

type Props = {
  goal?: SavingGoalDto | null;
  onSaved: (goal: SavingGoalDto) => void;
};

export function GoalForm({ goal, onSaved }: Readonly<Props>) {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { dateFormat } = useMobileUserPreferences();
  const {
    accounts,
    isError: accountsError,
    isLoading: accountsLoading,
    refetch,
  } = useAccounts();
  const { createSavingGoalMutation, updateSavingGoalMutation } =
    useSavingGoalMutations();
  const [name, setName] = useState(goal?.name ?? '');
  const [amount, setAmount] = useState(goal ? String(goal.targetAmount) : '');
  const [description, setDescription] = useState(goal?.description ?? '');
  const [accountIds, setAccountIds] = useState<string[]>(goal?.accounts ?? []);
  const [targetDate, setTargetDate] = useState<Date | null>(
    goal?.targetDate ? new Date(goal.targetDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [errors, setErrors] = useState<
    ReturnType<typeof validateGoal>['errors']
  >({});
  const [requestError, setRequestError] = useState(false);
  const pending =
    createSavingGoalMutation.isPending || updateSavingGoalMutation.isPending;
  const selectedAccounts = accounts.filter((account) =>
    accountIds.includes(account.id),
  );
  const currency = selectedAccounts[0]?.currency ?? goal?.currency ?? null;
  const accountSummary = selectedAccounts
    .map((account) => account.name)
    .join(', ');

  async function save() {
    const result = validateGoal({
      name,
      targetAmount: amount,
      accountIds,
      targetDate,
    });
    setErrors(result.errors);
    if (!result.valid || pending) return;
    setRequestError(false);
    const request = {
      name: name.trim(),
      description: description.trim(),
      targetAmount: result.amount,
      targetDate: targetDate ?? null,
      accounts: accountIds,
    };
    try {
      const saved = goal
        ? await updateSavingGoalMutation.mutateAsync({ id: goal.id, request })
        : await createSavingGoalMutation.mutateAsync({
            request: { ...request, targetDate: targetDate ?? undefined },
          });
      onSaved(saved);
    } catch {
      setRequestError(true);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xl,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.xs }}>
          <Text
            accessibilityRole="header"
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.xl,
              fontWeight: '700',
            }}
          >
            {goal ? 'Edit goal' : 'Create a goal'}
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            {t('copy_1r3cf77')}
          </Text>
        </View>
        {requestError && (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.status.error }}
          >
            {t('copy_ysbdse')}
          </Text>
        )}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface.background.primary,
              borderColor: colors.surface.border.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              gap: spacing.md,
            },
          ]}
        >
          <View>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('copy_1veqenn')}
            </Text>
            <TextInput
              accessibilityLabel={t('copy_iwiiq1')}
              autoCapitalize="sentences"
              onChangeText={setName}
              placeholder={t('copy_11thfpd')}
              placeholderTextColor={colors.text.secondary}
              style={[
                styles.input,
                {
                  color: colors.text.primary,
                  borderColor: errors.name
                    ? colors.status.error
                    : colors.surface.border.input,
                  borderRadius: borderRadius.md,
                },
              ]}
              value={name}
            />
            {errors.name && (
              <Text
                accessibilityRole="alert"
                style={{ color: colors.status.error }}
              >
                {errors.name}
              </Text>
            )}
          </View>
          <View>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('copy_68hbm')}
              {currency ? ` (${currency})` : ''}
            </Text>
            <TextInput
              accessibilityLabel={t('copy_cr3ef8')}
              keyboardType="decimal-pad"
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.text.secondary}
              style={[
                styles.input,
                {
                  color: colors.text.primary,
                  borderColor: errors.targetAmount
                    ? colors.status.error
                    : colors.surface.border.input,
                  borderRadius: borderRadius.md,
                },
              ]}
              value={amount}
            />
            {errors.targetAmount && (
              <Text
                accessibilityRole="alert"
                style={{ color: colors.status.error }}
              >
                {errors.targetAmount}
              </Text>
            )}
          </View>
          <View>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('copy_14pfk83')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('copy_j1ft96')}
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.input,
                {
                  borderColor: colors.surface.border.input,
                  borderRadius: borderRadius.md,
                  justifyContent: 'center',
                },
              ]}
            >
              <Text style={{ color: colors.text.primary }}>
                {targetDate
                  ? formatPreferenceDate(targetDate, dateFormat)
                  : 'Select a date'}
              </Text>
            </Pressable>
            {targetDate && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('copy_1pf77rd')}
                onPress={() => setTargetDate(null)}
                style={styles.clear}
              >
                <Text style={{ color: colors.accent.primary }}>
                  {t('copy_9vet5e')}
                </Text>
              </Pressable>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={targetDate ?? new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (event.type === 'set' && date) setTargetDate(date);
                }}
              />
            )}
          </View>
          <View>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('copy_1lwp3g2')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('copy_db1lbj')}
              onPress={() => setShowAccounts(true)}
              style={[
                styles.input,
                {
                  borderColor: errors.accountIds
                    ? colors.status.error
                    : colors.surface.border.input,
                  borderRadius: borderRadius.md,
                  justifyContent: 'center',
                },
              ]}
            >
              <Text numberOfLines={1} style={{ color: colors.text.primary }}>
                {accountSummary || 'Select accounts'}
              </Text>
            </Pressable>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.xs,
                marginTop: spacing.xs,
              }}
            >
              {t('copy_1pm5sc5')}
            </Text>
            {errors.accountIds && (
              <Text
                accessibilityRole="alert"
                style={{ color: colors.status.error }}
              >
                {errors.accountIds}
              </Text>
            )}
            {accountsLoading && (
              <Text style={{ color: colors.text.secondary }}>
                {t('copy_9excwh')}
              </Text>
            )}
            {accountsError && (
              <Button onClick={() => void refetch()} variant="outline">
                {t('copy_kvmgbn')}
              </Button>
            )}
            {!accountsLoading && !accountsError && accounts.length === 0 && (
              <View style={{ gap: spacing.sm }}>
                <Text style={{ color: colors.text.secondary }}>
                  {t('copy_wcgc3e')}
                </Text>
                <Button
                  onClick={() => router.push('/(protected)/(tabs)/accounts')}
                  variant="outline"
                >
                  {t('copy_18h88cs')}
                </Button>
              </View>
            )}
          </View>
          <View>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              {t('copy_dugpk4')}
            </Text>
            <TextInput
              accessibilityLabel={t('copy_c1hv4k')}
              multiline
              onChangeText={setDescription}
              placeholder={t('copy_80sifx')}
              placeholderTextColor={colors.text.secondary}
              style={[
                styles.input,
                styles.description,
                {
                  color: colors.text.primary,
                  borderColor: colors.surface.border.input,
                  borderRadius: borderRadius.md,
                },
              ]}
              value={description}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.surface.border.primary,
            backgroundColor: colors.surface.background.primary,
            padding: spacing.md,
          },
        ]}
      >
        <Button
          onClick={() => void save()}
          disabled={
            pending || accountsLoading || accountsError || accounts.length === 0
          }
        >
          {pending ? 'Saving goal…' : goal ? 'Save changes' : 'Create goal'}
        </Button>
      </View>
      <GoalAccountsSheet
        accounts={accounts}
        selectedIds={accountIds}
        visible={showAccounts}
        onDismiss={() => setShowAccounts(false)}
        onApply={(ids) => {
          setAccountIds(ids);
          setShowAccounts(false);
          setErrors((current) => ({ ...current, accountIds: undefined }));
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderWidth: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  description: { minHeight: 78, textAlignVertical: 'top' },
  clear: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
});
