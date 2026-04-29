import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { AccountInput } from '@/features/accounts/components/AccountInput';
import {
  CreateSubscriptionRequest,
  RecurrenceCadence,
  RecurringPaymentType,
} from '@guallet/api-client';
import { useSubscriptionsMutations } from '@guallet/api-react';
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
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const subscriptionFormDataSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z.number().positive({ message: 'Amount must be greater than zero' }),
  currency: z.string().nullable().default(null),
  cadence: z.enum(RecurrenceCadence).default(RecurrenceCadence.MONTHLY),
  type: z.enum(RecurringPaymentType).default(RecurringPaymentType.SUBSCRIPTION),
  startDate: z.date({ error: 'Start date is required' }),
  imageUrl: z.string().optional(),
  accountId: z.string().nullable().default(null),
});
type AddSubscriptionFormData = z.infer<typeof subscriptionFormDataSchema>;

export function AddSubscriptionScreen() {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const navigate = useNavigate();
  const { createSubscriptionMutation } = useSubscriptionsMutations();
  const defaultCurrency = useDefaultCurrency();

  const paymentTypes = [
    {
      label: t('screens.subscriptions.list.types.subscription', 'Subscription'),
      value: RecurringPaymentType.SUBSCRIPTION,
    },
    {
      label: t(
        'screens.subscriptions.list.types.regularPayment',
        'Regular payment',
      ),
      value: RecurringPaymentType.REGULAR_PAYMENT,
    },
    {
      label: t(
        'screens.subscriptions.list.types.regularIncome',
        'Regular income',
      ),
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

  const form = useForm<AddSubscriptionFormData>({
    validate: zod4Resolver(subscriptionFormDataSchema),
    initialValues: {
      name: '',
      amount: 0,
      currency: defaultCurrency,
      cadence: RecurrenceCadence.MONTHLY,
      type: RecurringPaymentType.SUBSCRIPTION,
      startDate: new Date(),
      imageUrl: '',
      accountId: null,
    },
  });
  const { values } = form;
  const currency = values.currency
    ? Currency.fromISOCode(values.currency)
    : Currency.fromISOCode(defaultCurrency);

  async function onFormSubmit(data: AddSubscriptionFormData): Promise<void> {
    if (data.currency === null) {
      notifications.show({
        title: t(
          'screens.subscriptions.create.errors.currencyRequired.title',
          'Currency required',
        ),
        message: t(
          'screens.subscriptions.create.errors.currencyRequired.message',
          'Please select a currency for the subscription.',
        ),
        color: 'red',
      });
      return;
    }

    const request: CreateSubscriptionRequest = {
      name: data.name,
      amount: data.amount,
      currency: data.currency ?? defaultCurrency,
      cadence: data.cadence,
      type: data.type,
      startDate: data.startDate.toISOString().split('T')[0],
      imageUrl: data.imageUrl || undefined,
      accountId: data.accountId ?? undefined,
    };

    try {
      const newSubscription = await createSubscriptionMutation.mutateAsync({
        request,
      });
      notifications.show({
        message: t(
          'screens.subscriptions.create.notifications.success',
          '{{name}} created successfully.',
          { name: newSubscription.name },
        ),
        color: 'green',
      });
      navigate({
        to: '/subscriptions/$id',
        params: { id: newSubscription.id },
      });
    } catch (error) {
      console.error('Error creating subscription', error);
      notifications.show({
        title: t(
          'screens.subscriptions.create.notifications.error.title',
          'Could not create subscription',
        ),
        message: t(
          'screens.subscriptions.create.notifications.error.message',
          'A network or server error occurred. Please try again.',
        ),
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen
      title={t('screens.subscriptions.create.title', 'New subscription')}
    >
      <Box maw={560} mx="auto">
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack gap={spacing.lg}>
            <Card withBorder shadow="sm" radius="lg" padding="lg">
              <Stack gap={0} mb={spacing.md}>
                <Text fw={600} size="sm">
                  {t(
                    'screens.subscriptions.create.formSection.title',
                    'Subscription details',
                  )}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(
                    'screens.subscriptions.create.formSection.description',
                    'Fill in the details below to track a recurring payment or income.',
                  )}
                </Text>
              </Stack>

              <Stack gap={spacing.md}>
                <TextInput
                  required
                  label={t(
                    'screens.subscriptions.create.fields.name.label',
                    'Name',
                  )}
                  placeholder={t(
                    'screens.subscriptions.create.fields.name.placeholder',
                    'e.g. Netflix, Spotify, Gym membership',
                  )}
                  error={form.errors.name}
                  {...form.getInputProps('name')}
                />

                <Select
                  required
                  label={t(
                    'screens.subscriptions.create.fields.type.label',
                    'Type',
                  )}
                  data={paymentTypes}
                  {...form.getInputProps('type')}
                  onChange={(value) => {
                    if (!value) return;
                    form.setFieldValue('type', value as RecurringPaymentType);
                  }}
                />
                <Select
                  required
                  label={t(
                    'screens.subscriptions.create.fields.cadence.label',
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
                    form.setFieldValue('currency', newValue);
                  }}
                />
                <NumberInput
                  required
                  label={t(
                    'screens.subscriptions.create.fields.amount.label',
                    'Amount',
                  )}
                  description={t(
                    'screens.subscriptions.create.fields.amount.description',
                    'Per payment',
                  )}
                  leftSection={
                    <Text size="sm" style={{ color: colors.midGrey }}>
                      {currency.symbol}
                    </Text>
                  }
                  decimalScale={currency.decimalPlaces ?? 2}
                  min={0}
                  styles={{ input: { fontVariantNumeric: 'tabular-nums' } }}
                  {...form.getInputProps('amount')}
                />

                <DateInput
                  required
                  label={t(
                    'screens.subscriptions.create.fields.startDate.label',
                    'Start date',
                  )}
                  description={t(
                    'screens.subscriptions.create.fields.startDate.description',
                    'When this payment starts or first occurs',
                  )}
                  placeholder={t(
                    'screens.subscriptions.create.fields.startDate.placeholder',
                    'Select a date',
                  )}
                  {...form.getInputProps('startDate')}
                />

                <AccountInput
                  description={t(
                    'screens.subscriptions.create.fields.account.description',
                    'Which account this payment comes from or goes into',
                  )}
                  value={values.accountId}
                  onChange={(val) =>
                    form.setFieldValue('accountId', val as string | null)
                  }
                />

                <TextInput
                  label={t(
                    'screens.subscriptions.create.fields.imageUrl.label',
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
                loading={createSubscriptionMutation.isPending}
              >
                {t(
                  'screens.subscriptions.create.submitButton',
                  'Create subscription',
                )}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate({ to: '/subscriptions' })}
              >
                {t('screens.subscriptions.create.cancelButton', 'Cancel')}
              </Button>
            </Stack>

            {/* Desktop actions */}
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/subscriptions' })}
              >
                {t('screens.subscriptions.create.cancelButton', 'Cancel')}
              </Button>
              <Button
                type="submit"
                loading={createSubscriptionMutation.isPending}
              >
                {t(
                  'screens.subscriptions.create.submitButton',
                  'Create subscription',
                )}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
