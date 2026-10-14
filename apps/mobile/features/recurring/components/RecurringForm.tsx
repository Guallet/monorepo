import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import {
  useHeaderHeight,
  usePreventRemove,
} from 'expo-router/react-navigation';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useCategories, useSubscriptionsMutations } from '@guallet/api-react';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  type SubscriptionDto,
} from '@guallet/api-client';
import {
  BottomSheet,
  Button,
  DateInput,
  TextInput,
  useAlert,
  useTheme,
  useToast,
} from '@guallet/luna-mobile';
import { CheckIcon, ChevronDownIcon } from '@guallet/luna-mobile/icons';
import { AmountInput } from '@/components/AmountInput';
import { findCurrency } from '@/components/currencyPickerData';
import { CategoryPicker } from '@/components/category-picker/CategoryPicker';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { formatPreferenceDate } from '@/utils/formatPreferenceDate';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';
import {
  CADENCE_OPTIONS,
  TYPE_OPTIONS,
  calendarDate,
  cadenceLabel,
  parseCalendarDate,
  validateRecurring,
  type RecurringFormValues,
} from '../recurring';
import { Choice, Copy } from './RecurringComponents';

export function RecurringForm({
  item,
  initialType = RecurringPaymentType.SUBSCRIPTION,
}: Readonly<{ item?: SubscriptionDto; initialType?: RecurringPaymentType }>) {
  const router = useRouter();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const alert = useAlert();
  const toast = useToast();
  const { spacing, colors, borderRadius } = useTheme();
  const { defaultCurrency, dateFormat } = useMobileUserPreferences();
  const categoryQuery = useCategories();
  const { createSubscriptionMutation, updateSubscriptionMutation } =
    useSubscriptionsMutations();
  const [initialValues] = useState<RecurringFormValues>(() => {
    let amount: number | null = null;
    if (item) amount = Number(item.amount);
    return {
      name: item?.name ?? '',
      amount,
      currency: item?.currency ?? defaultCurrency,
      type: item?.type ?? initialType,
      cadence: item?.cadence ?? RecurrenceCadence.MONTHLY,
      startDate: parseCalendarDate(item?.startDate),
      categoryId: item?.categoryId ?? null,
    };
  });
  const [baseline, setBaseline] = useState(initialValues);
  const currencyChosen = useRef(Boolean(item));
  const [requestError, setRequestError] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const isEditing = Boolean(item);
  const pending =
    createSubscriptionMutation.isPending ||
    updateSubscriptionMutation.isPending;
  const recurringSchema = useMemo(
    () =>
      z
        .object({
          name: z.string(),
          amount: z.number().nullable(),
          currency: z.string(),
          type: z.enum([
            RecurringPaymentType.SUBSCRIPTION,
            RecurringPaymentType.REGULAR_PAYMENT,
            RecurringPaymentType.REGULAR_INCOME,
          ]),
          cadence: z.enum([
            RecurrenceCadence.WEEKLY,
            RecurrenceCadence.BIWEEKLY,
            RecurrenceCadence.MONTHLY,
            RecurrenceCadence.QUARTERLY,
            RecurrenceCadence.YEARLY,
          ]),
          startDate: z.date().nullable(),
          categoryId: z.string().nullable(),
        })
        .superRefine((values, context) => {
          const validation = validateRecurring(values);
          for (const [key, message] of Object.entries(validation)) {
            context.addIssue({
              code: 'custom',
              path: [key],
              message,
            });
          }
        }),
    [],
  );
  const form = useForm({
    defaultValues: initialValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: recurringSchema },
    onSubmit: async ({ value }) => {
      Keyboard.dismiss();
      setRequestError(false);
      const request = {
        name: value.name.trim(),
        amount: value.amount!,
        currency: value.currency,
        type: value.type,
        cadence: value.cadence,
        startDate: value.startDate ? calendarDate(value.startDate) : null,
      };
      try {
        let saved: SubscriptionDto;
        if (item)
          saved = await updateSubscriptionMutation.mutateAsync({
            id: item.id,
            request: { ...request, categoryId: value.categoryId },
          });
        else
          saved = await createSubscriptionMutation.mutateAsync({
            request: {
              ...request,
              categoryId: value.categoryId ?? undefined,
            },
          });
        toast.success('Recurring item saved');
        setSavedId(saved.id);
      } catch {
        setRequestError(true);
      }
    },
  });
  const values = useStore(form.store, (state) => state.values);
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);
  useEffect(() => {
    if (!item && !currencyChosen.current) {
      form.setFieldValue('currency', defaultCurrency);
      setBaseline((current) => ({ ...current, currency: defaultCurrency }));
    }
  }, [defaultCurrency, form, item]);
  usePreventRemove((dirty || pending) && !savedId, ({ data }) => {
    if (pending) return;
    alert({
      title: 'Discard changes?',
      message: 'Your changes haven’t been saved.',
      actions: [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard changes',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    });
  });
  useEffect(() => {
    if (!savedId) return;
    if (isEditing) router.back();
    else
      router.replace({ pathname: '/recurring/[id]', params: { id: savedId } });
  }, [savedId, isEditing, router]);
  const selectedCurrency = useMemo(
    () =>
      findCurrency(values.currency) ??
      findCurrency(defaultCurrency) ??
      findCurrency('GBP')!,
    [values.currency, defaultCurrency],
  );
  function change<K extends keyof RecurringFormValues>(
    key: K,
    value: RecurringFormValues[K],
  ) {
    switch (key) {
      case 'name':
        form.setFieldValue('name', value as RecurringFormValues['name']);
        break;
      case 'amount':
        form.setFieldValue('amount', value as RecurringFormValues['amount']);
        break;
      case 'currency':
        form.setFieldValue(
          'currency',
          value as RecurringFormValues['currency'],
        );
        break;
      case 'type':
        form.setFieldValue('type', value as RecurringFormValues['type']);
        break;
      case 'cadence':
        form.setFieldValue('cadence', value as RecurringFormValues['cadence']);
        break;
      case 'startDate':
        form.setFieldValue(
          'startDate',
          value as RecurringFormValues['startDate'],
        );
        break;
      case 'categoryId':
        form.setFieldValue(
          'categoryId',
          value as RecurringFormValues['categoryId'],
        );
        break;
    }
  }
  function errorFor(key: keyof RecurringFormValues) {
    return form.getFieldMeta(key)?.errors[0]?.message;
  }
  let amountLabel = 'Amount paid';
  if (values.type === RecurringPaymentType.REGULAR_INCOME)
    amountLabel = 'Amount received';
  let saveLabel = 'Save recurring item';
  if (item) saveLabel = 'Save changes';
  if (pending) saveLabel = 'Saving…';
  let keyboardBehavior: 'padding' | undefined;
  if (Platform.OS === 'ios') keyboardBehavior = 'padding';
  const categoriesAvailable =
    !categoryQuery.isLoading && !(categoryQuery.isError && !categoryQuery.data);
  return (
    <KeyboardAvoidingView
      behavior={keyboardBehavior}
      keyboardVerticalOffset={headerHeight}
      style={styles.flex}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
      >
        <View style={{ gap: spacing.sm }}>
          <Copy>Type</Copy>
          <View style={[styles.types, { gap: spacing.sm }]}>
            {TYPE_OPTIONS.map((option) => (
              <Choice
                key={option.id}
                label={option.label}
                selected={values.type === option.id}
                disabled={pending}
                onPress={() => change('type', option.id)}
              />
            ))}
          </View>
        </View>
        <TextInput
          label="Name"
          accessibilityLabel="Name"
          accessibilityHint={errorFor('name')}
          value={values.name}
          onChangeText={(value) => change('name', value)}
          error={errorFor('name')}
          disabled={pending}
          autoCapitalize="sentences"
        />
        {!findCurrency(values.currency) && (
          <Copy error>
            This item uses {values.currency}. Choose a supported currency before
            saving.
          </Copy>
        )}
        <AmountInput
          label={amountLabel}
          value={values.amount}
          currency={selectedCurrency}
          disabled={pending}
          onChange={(value) => change('amount', value)}
          onCurrencyChange={(currency) => {
            currencyChosen.current = true;
            change('currency', currency.code);
          }}
          error={errorFor('amount')}
        />
        <View style={{ gap: spacing.sm }}>
          <Copy>Repeats</Copy>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Repeats, ${cadenceLabel(values.cadence)}`}
            accessibilityState={{ expanded: frequencyOpen, disabled: pending }}
            disabled={pending}
            onPress={() => {
              Keyboard.dismiss();
              setFrequencyOpen(true);
            }}
            style={[
              styles.selector,
              {
                backgroundColor: colors.surface.background.primary,
                borderColor: colors.surface.border.primary,
                borderRadius: borderRadius.md,
                padding: spacing.md,
              },
            ]}
          >
            <Copy>{cadenceLabel(values.cadence)}</Copy>
            <ChevronDownIcon
              accessible={false}
              color={colors.text.secondary}
              size={spacing.lg}
            />
          </Pressable>
        </View>
        <View>
          <DateInput
            label="First payment date · Optional"
            value={values.startDate}
            disabled={pending}
            error={errorFor('startDate')}
            onFocus={Keyboard.dismiss}
            onChange={(value) => change('startDate', value)}
            formatValue={(value) => formatPreferenceDate(value, dateFormat)}
          />
          <Copy muted>
            We use this date to calculate future payments. Leave it empty to
            track the amount without a schedule.
          </Copy>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Copy>Category · Optional</Copy>
          {categoryQuery.isLoading && <Copy muted>Loading categories…</Copy>}
          {categoryQuery.isError && (
            <>
              <Copy error>
                Couldn’t load categories. Your current selection is preserved.
              </Copy>
              <Button
                variant="outline"
                onClick={() => void categoryQuery.refetch()}
              >
                Try again
              </Button>
            </>
          )}
          {categoriesAvailable && !pending && (
            <CategoryPicker
              selectionMode="single"
              categories={categoryQuery.categories}
              value={values.categoryId}
              onChange={(value) => change('categoryId', value)}
              allowClear
              clearLabel="No category"
            />
          )}
        </View>
        <Copy muted>
          Tracks expected payments in Guallet. No payments are created
          automatically.
        </Copy>
        {requestError && (
          <Copy error>
            Couldn’t save this item. Your changes are still here. Please try
            again.
          </Copy>
        )}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              disabled={!canSubmit || isSubmitting || pending}
              style={styles.action}
              onClick={() => {
                if (!form.state.isSubmitting) void form.handleSubmit();
              }}
            >
              {isSubmitting || pending ? 'Saving…' : saveLabel}
            </Button>
          )}
        </form.Subscribe>
        <Button
          disabled={pending}
          style={styles.action}
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </ScrollView>
      <BottomSheet
        isOpen={frequencyOpen}
        title="Repeats"
        showCloseIcon
        onClose={() => setFrequencyOpen(false)}
      >
        <View style={{ gap: spacing.sm, padding: spacing.md }}>
          {CADENCE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: option.id === values.cadence }}
              onPress={() => {
                change('cadence', option.id);
                setFrequencyOpen(false);
              }}
              style={[styles.selector, { padding: spacing.md }]}
            >
              <Copy>{option.label}</Copy>
              {values.cadence === option.id && (
                <CheckIcon
                  accessible={false}
                  color={colors.accent.primary}
                  size={spacing.lg}
                />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  types: { flexDirection: 'row', flexWrap: 'wrap' },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    minHeight: 48,
  },
  action: { height: 'auto', minHeight: 48, paddingVertical: 12 },
});
