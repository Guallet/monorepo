import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AccountInput } from '@/features/accounts/components/AccountInput';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
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
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  IconCalendarRepeat,
  IconDeviceFloppy,
  IconX,
} from '@tabler/icons-react';

interface EditSubscriptionScreenProps {
  subscriptionId: string;
}

const editSubscriptionFormDataSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z.number().min(0, { message: 'Amount must be positive' }),
  currency: z.string().default('GBP'),
  cadence: z.enum(RecurrenceCadence).default(RecurrenceCadence.MONTHLY),
  type: z.enum(RecurringPaymentType).default(RecurringPaymentType.SUBSCRIPTION),
  startDate: z.date({ error: 'Start date is required' }),
  imageUrl: z.string().optional(),
  accountId: z.string().nullable().optional(),
});
type EditSubscriptionFormData = z.infer<typeof editSubscriptionFormDataSchema>;

const paymentTypes = [
  { label: 'Subscription', value: RecurringPaymentType.SUBSCRIPTION },
  { label: 'Regular Payment', value: RecurringPaymentType.REGULAR_PAYMENT },
  { label: 'Regular Income', value: RecurringPaymentType.REGULAR_INCOME },
];

const cadenceOptions = [
  { label: 'Weekly', value: RecurrenceCadence.WEEKLY },
  { label: 'Bi-weekly', value: RecurrenceCadence.BIWEEKLY },
  { label: 'Monthly', value: RecurrenceCadence.MONTHLY },
  { label: 'Quarterly', value: RecurrenceCadence.QUARTERLY },
  { label: 'Yearly', value: RecurrenceCadence.YEARLY },
];

export function EditSubscriptionScreen({
  subscriptionId,
}: Readonly<EditSubscriptionScreenProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { subscription, isLoading } = useSubscription(subscriptionId);
  const defaultCurrency = useDefaultCurrency();
  const navigate = useNavigate();
  const { updateSubscriptionMutation } = useSubscriptionsMutations();

  const form = useForm<EditSubscriptionFormData>({
    initialValues: {
      name: subscription?.name ?? '',
      amount: Number(subscription?.amount ?? 0),
      currency: subscription?.currency ?? defaultCurrency,
      cadence: subscription?.cadence ?? RecurrenceCadence.MONTHLY,
      type: subscription?.type ?? RecurringPaymentType.SUBSCRIPTION,
      startDate: subscription?.startDate
        ? new Date(subscription.startDate)
        : new Date(),
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
        startDate: subscription.startDate
          ? new Date(subscription.startDate)
          : new Date(),
        imageUrl: subscription.imageUrl ?? '',
        accountId: subscription.accountId ?? null,
      });
    }
  }, [form, subscription]);

  async function onFormSubmit(data: EditSubscriptionFormData) {
    const imageUrl = data.imageUrl?.trim();

    const request: UpdateSubscriptionRequest = {
      name: data.name,
      amount: data.amount,
      currency: data.currency,
      cadence: data.cadence,
      type: data.type,
      startDate: data.startDate.toISOString().split('T')[0],
      imageUrl: imageUrl || undefined,
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
      <Box mx="auto">
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack gap={spacing.md}>
            <Card withBorder shadow="sm" radius="lg" padding={spacing.lg}>
              <Group gap={spacing.md} align="flex-start" wrap="nowrap">
                <ThemeIcon size={40} radius="md" variant="light" color="blue">
                  <IconCalendarRepeat size={24} strokeWidth={1.5} />
                </ThemeIcon>
                <Box>
                  <Text fw={600}>
                    {t(
                      'screens.subscriptions.edit.form.title',
                      'Subscription details',
                    )}
                  </Text>
                  <Text size="sm" c="dimmed" mt={spacing.xs}>
                    {t(
                      'screens.subscriptions.edit.form.description',
                      'Keep recurring payment details accurate for forecasts and reminders.',
                    )}
                  </Text>
                </Box>
              </Group>

              <Stack gap={spacing.md} mt={spacing.lg}>
                <TextInput
                  key={form.key('name')}
                  required
                  label={t(
                    'screens.subscriptions.edit.fields.name.label',
                    'Name',
                  )}
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
                  label={t(
                    'screens.subscriptions.edit.fields.type.label',
                    'Type',
                  )}
                  data={paymentTypes.map((option) => ({
                    value: option.value,
                    label: t(
                      `screens.subscriptions.edit.types.${option.value}`,
                      option.label,
                    ),
                  }))}
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
                  data={cadenceOptions.map((option) => ({
                    value: option.value,
                    label: t(
                      `screens.subscriptions.edit.cadence.${option.value}`,
                      option.label,
                    ),
                  }))}
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
                <AccountInput
                  key={form.key('accountId')}
                  label={t(
                    'screens.subscriptions.edit.fields.account.label',
                    'Account',
                  )}
                  description={t('common.optional', 'Optional')}
                  placeholder={t(
                    'screens.subscriptions.edit.fields.account.placeholder',
                    'Select an account',
                  )}
                  {...form.getInputProps('accountId')}
                />
                <NumberInput
                  key={form.key('amount')}
                  required
                  label={t(
                    'screens.subscriptions.edit.fields.amount.label',
                    'Amount',
                  )}
                  description={t(
                    'screens.subscriptions.edit.fields.amount.description',
                    'The recurring payment amount',
                  )}
                  leftSection={currency.symbol}
                  decimalScale={currency.decimalPlaces}
                  min={0}
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

                <TextInput
                  key={form.key('imageUrl')}
                  label={t(
                    'screens.subscriptions.edit.fields.imageUrl.label',
                    'Image URL',
                  )}
                  description={t('common.optional', 'Optional')}
                  placeholder={t(
                    'screens.subscriptions.edit.fields.imageUrl.placeholder',
                    'https://example.com/logo.png',
                  )}
                  {...form.getInputProps('imageUrl')}
                />
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="lg" padding={spacing.md}>
              <Stack gap={spacing.md}>
                <Group justify="space-between" wrap="nowrap">
                  <Box>
                    <Text fw={600}>
                      {t(
                        'screens.subscriptions.edit.actions.title',
                        'Save changes',
                      )}
                    </Text>
                    <Text size="sm" c="dimmed" mt={spacing.xs}>
                      {t(
                        'screens.subscriptions.edit.actions.description',
                        'Updates will apply to future subscription forecasts.',
                      )}
                    </Text>
                  </Box>
                  <Group gap={spacing.sm} visibleFrom="sm">
                    <Button
                      variant="default"
                      leftSection={<IconX size={16} strokeWidth={1.5} />}
                      onClick={() =>
                        navigate({
                          to: '/subscriptions/$id',
                          params: { id: subscriptionId },
                        })
                      }
                    >
                      {t('screens.subscriptions.edit.cancelButton', 'Cancel')}
                    </Button>
                    <Button
                      type="submit"
                      leftSection={
                        <IconDeviceFloppy size={16} strokeWidth={1.5} />
                      }
                      loading={updateSubscriptionMutation.isPending}
                    >
                      {t(
                        'screens.subscriptions.edit.submitButton',
                        'Save changes',
                      )}
                    </Button>
                  </Group>
                </Group>
              </Stack>
            </Card>

            <Stack gap={spacing.xs} hiddenFrom="sm">
              <Button
                type="submit"
                fullWidth
                size="md"
                leftSection={<IconDeviceFloppy size={16} strokeWidth={1.5} />}
                loading={updateSubscriptionMutation.isPending}
              >
                {t('screens.subscriptions.edit.submitButton', 'Save changes')}
              </Button>
              <Button
                variant="default"
                fullWidth
                size="md"
                leftSection={<IconX size={16} strokeWidth={1.5} />}
                onClick={() =>
                  navigate({
                    to: '/subscriptions/$id',
                    params: { id: subscriptionId },
                  })
                }
              >
                {t('screens.subscriptions.edit.cancelButton', 'Cancel')}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
