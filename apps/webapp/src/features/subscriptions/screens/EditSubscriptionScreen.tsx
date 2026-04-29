import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { AccountInput } from '@/features/accounts/components/AccountInput';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  UpdateSubscriptionRequest,
} from '@guallet/api-client';
import { useSubscription, useSubscriptionsMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface EditSubscriptionScreenProps {
  subscriptionId: string;
}

const editSubscriptionFormDataSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z.number().min(0, { message: 'Amount must be positive' }),
  currency: z.string().default('GBP'),
  cadence: z.enum(RecurrenceCadence).default(RecurrenceCadence.MONTHLY),
  type: z.enum(RecurringPaymentType).default(RecurringPaymentType.SUBSCRIPTION),
  startDate: z.date({ required_error: 'Start date is required' }),
  imageUrl: z.string().optional(),
  accountId: z.string().nullable().default(null),
});
type EditSubscriptionFormData = z.infer<typeof editSubscriptionFormDataSchema>;

export function EditSubscriptionScreen({
  subscriptionId,
}: Readonly<EditSubscriptionScreenProps>) {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const { subscription, isLoading } = useSubscription(subscriptionId);
  const defaultCurrency = useDefaultCurrency();
  const navigate = useNavigate();
  const { updateSubscriptionMutation } = useSubscriptionsMutations();

  const paymentTypes = [
    {
      label: t('screens.subscriptions.list.types.subscription', 'Subscription'),
      value: RecurringPaymentType.SUBSCRIPTION,
    },
    {
      label: t('screens.subscriptions.list.types.regularPayment', 'Regular payment'),
      value: RecurringPaymentType.REGULAR_PAYMENT,
    },
    {
      label: t('screens.subscriptions.list.types.regularIncome', 'Regular income'),
      value: RecurringPaymentType.REGULAR_INCOME,
    },
  ];

  const cadenceOptions = [
    {
      label: t('screens.subscriptions.list.cadence.weekly', 'Weekly'),
      value: RecurrenceCadence.WEEKLY,
    },
    {
      label: t('screens.subscriptions.list.cadence.biweekly', 'Bi-weekly'),
      value: RecurrenceCadence.BIWEEKLY,
    },
    {
      label: t('screens.subscriptions.list.cadence.monthly', 'Monthly'),
      value: RecurrenceCadence.MONTHLY,
    },
    {
      label: t('screens.subscriptions.list.cadence.quarterly', 'Quarterly'),
      value: RecurrenceCadence.QUARTERLY,
    },
    {
      label: t('screens.subscriptions.list.cadence.yearly', 'Yearly'),
      value: RecurrenceCadence.YEARLY,
    },
  ];

  const form = useForm<EditSubscriptionFormData>({
    initialValues: {
      name: subscription?.name ?? '',
      amount: Number(subscription?.amount ?? 0),
      currency: subscription?.currency ?? defaultCurrency,
      cadence: subscription?.cadence ?? RecurrenceCadence.MONTHLY,
      type: subscription?.type ?? RecurringPaymentType.SUBSCRIPTION,
      startDate: subscription?.startDate ? new Date(subscription.startDate) : new Date(),
      imageUrl: subscription?.imageUrl ?? '',
      accountId: subscription?.accountId ?? null,
    },
    validate: zod4Resolver(editSubscriptionFormDataSchema),
  });
  const { values } = form;
  const currency = Currency.fromISOCode(values.currency ?? defaultCurrency);

  useEffect(() => {
    if (subscription) {
      form.setValues({
        name: subscription.name,
        amount: Number(subscription.amount),
        currency: subscription.currency,
        cadence: subscription.cadence,
        type: subscription.type,
        startDate: new Date(subscription.startDate!),
        imageUrl: subscription.imageUrl ?? '',
        accountId: subscription.accountId ?? null,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription]);

  async function onFormSubmit(data: EditSubscriptionFormData) {
    const request: UpdateSubscriptionRequest = {
      name: data.name,
      amount: data.amount,
      currency: data.currency,
      cadence: data.cadence,
      type: data.type,
      startDate: data.startDate.toISOString().split('T')[0],
      imageUrl: data.imageUrl || undefined,
      accountId: data.accountId ?? undefined,
    };

    try {
      const updated = await updateSubscriptionMutation.mutateAsync({
        id: subscriptionId,
        request,
      });
      notifications.show({
        message: t(
          'screens.subscriptions.edit.notifications.success',
          '{{name}} updated successfully.',
          { name: updated.name },
        ),
        color: 'green',
      });
      navigate({ to: '/subscriptions/$id', params: { id: updated.id } });
    } catch (error) {
      console.error('Error updating subscription', error);
      notifications.show({
        title: t(
          'screens.subscriptions.edit.notifications.error.title',
          'Could not update subscription',
        ),
        message: t(
          'screens.subscriptions.edit.notifications.error.message',
          'A network or server error occurred. Please try again.',
        ),
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.subscriptions.edit.title', 'Edit subscription')}
    >
      <Box maw={560} mx="auto">
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack gap={spacing.lg}>
            <Card withBorder shadow="sm" radius="lg" padding={{ base: 'md', sm: 'lg' }}>
              <Stack gap={0} mb={spacing.md}>
                <Text fw={600} size="sm">
                  {t('screens.subscriptions.edit.formSection.title', 'Subscription details')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(
                    'screens.subscriptions.edit.formSection.description',
                    'Update the details for this recurring payment or income.',
                  )}
                </Text>
              </Stack>

              <Stack gap={spacing.md}>
                <TextInput
                  key={form.key('name')}
                  required
                  label={t('screens.subscriptions.edit.fields.name.label', 'Name')}
                  placeholder={t(
                    'screens.subscriptions.edit.fields.name.placeholder',
                    'e.g. Netflix, Spotify, Gym membership',
                  )}
                  error={form.errors.name}
                  {...form.getInputProps('name')}
                />

                <Select
                  key={form.key('type')}
                  required
                  label={t('screens.subscriptions.edit.fields.type.label', 'Type')}
                  data={paymentTypes}
                  {...form.getInputProps('type')}
                  onChange={(value) => {
                    if (!value) return;
                    form.setFieldValue('type', value as RecurringPaymentType);
                  }}
                />
                <Select
                  key={form.key('cadence')}
                  required
                  label={t(
                    'screens.subscriptions.edit.fields.cadence.label',
                    'Frequency',
                  )}
                  data={cadenceOptions}
                  {...form.getInputProps('cadence')}
                  onChange={(value) => {
                    if (!value) return;
                    form.setFieldValue('cadence', value as RecurrenceCadence);
                  }}
                />
                <CurrencyPicker
                  name="currency"
                  required
                  value={values.currency}
                  onValueChanged={(newValue) => {
                    form.setFieldValue('currency', newValue ?? defaultCurrency);
                  }}
                />
                <NumberInput
                  key={form.key('amount')}
                  required
                  label={t('screens.subscriptions.edit.fields.amount.label', 'Amount')}
                  description={t(
                    'screens.subscriptions.edit.fields.amount.description',
                    'Per payment',
                  )}
                  leftSection={
                    <Text size="sm" style={{ color: colors.midGrey }}>
                      {currency.symbol}
                    </Text>
                  }
                  decimalScale={currency.decimalPlaces}
                  min={0}
                  styles={{ input: { fontVariantNumeric: 'tabular-nums' } }}
                  {...form.getInputProps('amount')}
                />

                <DateInput
                  key={form.key('startDate')}
                  required
                  label={t(
                    'screens.subscriptions.edit.fields.startDate.label',
                    'Start date',
                  )}
                  description={t(
                    'screens.subscriptions.edit.fields.startDate.description',
                    'When this payment starts or first occurs',
                  )}
                  placeholder={t(
                    'screens.subscriptions.edit.fields.startDate.placeholder',
                    'Select a date',
                  )}
                  {...form.getInputProps('startDate')}
                />

                <AccountInput
                  key={form.key('accountId')}
                  description={t(
                    'screens.subscriptions.edit.fields.account.description',
                    'Which account this payment comes from or goes into',
                  )}
                  value={values.accountId}
                  onChange={(val) => form.setFieldValue('accountId', val as string | null)}
                />

                <TextInput
                  key={form.key('imageUrl')}
                  label={t(
                    'screens.subscriptions.edit.fields.imageUrl.label',
                    'Logo URL',
                  )}
                  description={t('common.optional', 'Optional')}
                  placeholder="https://example.com/logo.png"
                  {...form.getInputProps('imageUrl')}
                />
              </Stack>
            </Card>

            {/* Mobile actions */}
            <Stack gap="xs" hiddenFrom="sm">
              <Button
                type="submit"
                fullWidth
                size="md"
                loading={updateSubscriptionMutation.isPending}
              >
                {t('screens.subscriptions.edit.submitButton', 'Save changes')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() =>
                  navigate({ to: '/subscriptions/$id', params: { id: subscriptionId } })
                }
              >
                {t('screens.subscriptions.edit.cancelButton', 'Cancel')}
              </Button>
            </Stack>

            {/* Desktop actions */}
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button
                variant="outline"
                onClick={() =>
                  navigate({ to: '/subscriptions/$id', params: { id: subscriptionId } })
                }
              >
                {t('screens.subscriptions.edit.cancelButton', 'Cancel')}
              </Button>
              <Button type="submit" loading={updateSubscriptionMutation.isPending}>
                {t('screens.subscriptions.edit.submitButton', 'Save changes')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
