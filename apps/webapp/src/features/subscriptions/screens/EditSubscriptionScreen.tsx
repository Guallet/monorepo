import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import {
  UpdateSubscriptionRequest,
  RecurringPaymentType,
  RecurrenceCadence,
} from '@guallet/api-client';
import { useSubscription, useSubscriptionsMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import {
  Stack,
  TextInput,
  NativeSelect,
  rem,
  NumberInput,
  Group,
  Button,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { z } from 'zod';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';

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
      startDate: subscription?.startDate ? new Date(subscription.startDate) : new Date(),
      imageUrl: subscription?.imageUrl ?? '',
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
        startDate: new Date(subscription.startDate),
        imageUrl: subscription.imageUrl ?? '',
      });
    }
  }, [form, subscription]);

  async function onFormSubmit(data: EditSubscriptionFormData) {
    console.log('Submitting form data', data);
    const request: UpdateSubscriptionRequest = {
      name: data.name,
      amount: data.amount,
      currency: data.currency,
      cadence: data.cadence,
      type: data.type,
      startDate: data.startDate.toISOString().split('T')[0],
      imageUrl: data.imageUrl || undefined,
    };

    try {
      const updatedSubscription = await updateSubscriptionMutation.mutateAsync({
        id: subscriptionId,
        request,
      });
      notifications.show({
        title: 'Subscription updated',
        message: `${updatedSubscription.name} has been updated`,
        color: 'green',
      });
      navigate({
        to: '/subscriptions/$id',
        params: {
          id: updatedSubscription.id,
        },
      });
    } catch (error) {
      console.error('Error updating subscription', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update subscription',
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <form onSubmit={form.onSubmit((values) => onFormSubmit(values))}>
        <Stack>
          <AppSection title="Edit subscription">
            <Stack>
              <TextInput
                key={form.key('name')}
                {...form.getInputProps('name')}
                required
                label="Name"
                placeholder="e.g., Netflix, Spotify, Gym membership"
                error={form.errors.name}
              />
              <NativeSelect
                key={form.key('type')}
                {...form.getInputProps('type')}
                required
                rightSection={
                  <IconChevronDown
                    style={{ width: rem(16), height: rem(16) }}
                  />
                }
                label="Type"
                data={paymentTypes}
              />
              <NativeSelect
                key={form.key('cadence')}
                {...form.getInputProps('cadence')}
                required
                rightSection={
                  <IconChevronDown
                    style={{ width: rem(16), height: rem(16) }}
                  />
                }
                label="Frequency"
                data={cadenceOptions}
              />
              <CurrencyPicker
                name="currency"
                required
                value={form.values.currency}
                onValueChanged={(newValue) => {
                  form.setFieldValue('currency', newValue ?? defaultCurrency);
                }}
              />
              <NumberInput
                key={form.key('amount')}
                {...form.getInputProps('amount')}
                label="Amount"
                required
                description="The recurring payment amount"
                leftSection={currency.symbol}
                decimalScale={currency.decimalPlaces}
                min={0}
              />
              <DateInput
                key={form.key('startDate')}
                {...form.getInputProps('startDate')}
                label="Start Date"
                required
                description="The date when this payment starts or first occurs"
                placeholder="Select a date"
              />
              <TextInput
                key={form.key('imageUrl')}
                {...form.getInputProps('imageUrl')}
                label="Image URL (optional)"
                placeholder="https://example.com/logo.png"
              />
            </Stack>
          </AppSection>
          <Group>
            <Button
              type="submit"
              loading={updateSubscriptionMutation.isPending}
            >
              Update subscription
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate({
                  to: '/subscriptions/$id',
                  params: { id: subscriptionId },
                });
              }}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </form>
    </BaseScreen>
  );
}
