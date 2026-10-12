import { useMemo, useState } from 'react';
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
import { availableGoalAccountIds, validateGoal } from '../models/savingGoal';
import {
  formatPreferenceDate,
  endOfPreferenceDay,
} from '@/utils/formatPreferenceDate';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';
import { fieldError, SubmitButton, submitForm } from '@/components/forms';

type Props = {
  goal?: SavingGoalDto | null;
  onSaved: (goal: SavingGoalDto) => void;
};

export function GoalForm({ goal, onSaved }: Readonly<Props>) {
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const pending =
    createSavingGoalMutation.isPending || updateSavingGoalMutation.isPending;
  const form = useForm({
    defaultValues: {
      name: goal?.name ?? '',
      targetAmount: goal ? String(goal.targetAmount) : '',
      description: goal?.description ?? '',
      accountIds: goal?.accounts ?? [],
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : null,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: useMemo(
        () =>
          z
            .object({
              name: z.string(),
              targetAmount: z.string(),
              description: z.string(),
              accountIds: z.array(z.string()),
              targetDate: z.date().nullable(),
            })
            .superRefine((value, context) => {
              const selected = accounts.filter((account) =>
                value.accountIds.includes(account.id),
              );
              const result = validateGoal({
                name: value.name,
                targetAmount: value.targetAmount,
                accountIds: availableGoalAccountIds(value.accountIds, accounts),
                currency: selected[0]?.currency ?? null,
                targetDate: value.targetDate,
              });
              for (const [key, message] of Object.entries(result.errors)) {
                if (!message) continue;
                const path = key === 'accountIds' ? 'accountIds' : key;
                context.addIssue({
                  code: 'custom',
                  path: [path],
                  message,
                });
              }
            }),
        [accounts],
      ),
    },
    onSubmit: async ({ value }) => {
      const validIds = availableGoalAccountIds(value.accountIds, accounts);
      const selected = accounts.filter((account) =>
        validIds.includes(account.id),
      );
      const result = validateGoal({
        name: value.name,
        targetAmount: value.targetAmount,
        accountIds: validIds,
        currency: selected[0]?.currency ?? null,
        targetDate: value.targetDate,
      });
      if (!result.valid) return;
      setRequestError(false);
      const request = {
        name: value.name.trim(),
        description: value.description.trim(),
        targetAmount: result.amount,
        targetDate: value.targetDate ?? null,
        accounts: validIds,
      };
      try {
        const saved = goal
          ? await updateSavingGoalMutation.mutateAsync({ id: goal.id, request })
          : await createSavingGoalMutation.mutateAsync({
              request: {
                ...request,
                targetDate: value.targetDate ?? undefined,
              },
            });
        onSaved(saved);
      } catch {
        setRequestError(true);
      }
    },
  });
  const values = useStore(form.store, (state) => state.values);
  const errors = {
    name: fieldError(form.getFieldMeta('name')?.errors ?? []),
    targetAmount: fieldError(form.getFieldMeta('targetAmount')?.errors ?? []),
    accountIds: fieldError(form.getFieldMeta('accountIds')?.errors ?? []),
  };
  const availableAccountIds = availableGoalAccountIds(
    values.accountIds,
    accounts,
  );
  const selectedAccounts = accounts.filter((account) =>
    availableAccountIds.includes(account.id),
  );
  const currency = selectedAccounts[0]?.currency ?? null;
  const accountSummary = selectedAccounts
    .map((account) => account.name)
    .join(', ');

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
            Choose what you are saving towards.
          </Text>
        </View>
        {requestError && (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.status.error }}
          >
            Couldn’t save this goal. Check your connection and try again.
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
              Goal name *
            </Text>
            <TextInput
              accessibilityLabel="Goal name"
              autoCapitalize="sentences"
              onChangeText={(name) => form.setFieldValue('name', name)}
              placeholder="e.g. Emergency fund"
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
              value={values.name}
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
              Target amount *{currency ? ` (${currency})` : ''}
            </Text>
            <TextInput
              accessibilityLabel="Target amount"
              keyboardType="decimal-pad"
              onChangeText={(targetAmount) =>
                form.setFieldValue('targetAmount', targetAmount)
              }
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
              value={values.targetAmount}
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
              Target date (optional)
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select target date"
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
                {values.targetDate
                  ? formatPreferenceDate(values.targetDate, dateFormat)
                  : 'Select a date'}
              </Text>
            </Pressable>
            {values.targetDate && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear target date"
                onPress={() => {
                  form.setFieldValue('targetDate', null);
                }}
                style={styles.clear}
              >
                <Text style={{ color: colors.accent.primary }}>Clear date</Text>
              </Pressable>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={values.targetDate ?? new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (event.type === 'set' && date) {
                    form.setFieldValue('targetDate', endOfPreferenceDay(date));
                  }
                }}
              />
            )}
          </View>
          <View>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Linked accounts *
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose linked accounts"
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
              Progress follows the balance of these accounts.
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
                Loading accounts…
              </Text>
            )}
            {accountsError && (
              <Button onClick={() => void refetch()} variant="outline">
                Retry loading accounts
              </Button>
            )}
            {!accountsLoading && !accountsError && accounts.length === 0 && (
              <View style={{ gap: spacing.sm }}>
                <Text style={{ color: colors.text.secondary }}>
                  Add an account before creating a goal.
                </Text>
                <Button
                  onClick={() => router.push('/accounts')}
                  variant="outline"
                >
                  View accounts
                </Button>
              </View>
            )}
          </View>
          <View>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Description (optional)
            </Text>
            <TextInput
              accessibilityLabel="Goal description"
              multiline
              onChangeText={(description) =>
                form.setFieldValue('description', description)
              }
              placeholder="Add a note"
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
              value={values.description}
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
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <SubmitButton
              canSubmit={canSubmit}
              disabled={
                accountsLoading || accountsError || accounts.length === 0
              }
              isSubmitting={isSubmitting || pending}
              onSubmit={() => void submitForm(form)}
              submittingLabel="Saving goal…"
            >
              {goal ? 'Save changes' : 'Create goal'}
            </SubmitButton>
          )}
        </form.Subscribe>
      </View>
      <GoalAccountsSheet
        accounts={accounts}
        selectedIds={availableAccountIds}
        visible={showAccounts}
        onDismiss={() => setShowAccounts(false)}
        onApply={(ids) => {
          form.setFieldValue('accountIds', ids);
          setShowAccounts(false);
          form.validateField('accountIds', 'change');
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
