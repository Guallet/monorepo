import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import {
  CreateSubscriptionRequest,
  RecurringPaymentType,
  RecurrenceCadence,
} from '@guallet/api-client';
import { useSubscriptionMutations } from '@guallet/api-react';
import {
  Stack,
  TextInput,
  NativeSelect,
  rem,
  NumberInput,
  Group,
  Button,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { Currency } from '@guallet/money';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';

const subscriptionFormDataSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z.number().min(0, { message: 'Amount must be positive' }),
  currency: z.string().nullable().default(null),
  cadence: z.enum(RecurrenceCadence).default(RecurrenceCadence.MONTHLY),
  type: z.enum(RecurringPaymentType).default(RecurringPaymentType.SUBSCRIPTION),
  imageUrl: z.string().optional(),
});
type AddSubscriptionFormData = z.infer<typeof subscriptionFormDataSchema>;

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

export function AddSubscriptionScreen() {
  const navigate = useNavigate();
  const { createSubscriptionMutation } = useSubscriptionMutations();
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<AddSubscriptionFormData>({
    validate: zod4Resolver(subscriptionFormDataSchema),
    initialValues: {
      name: '',
      amount: 0,
      currency: defaultCurrency,
      cadence: RecurrenceCadence.MONTHLY,
      type: RecurringPaymentType.SUBSCRIPTION,
      imageUrl: '',
    },
  });
  const { values } = form;

  const currencyValue = values.currency;
  const currency = currencyValue
    ? Currency.fromISOCode(currencyValue)
    : Currency.fromISOCode(defaultCurrency);

  async function onFormSubmit(data: AddSubscriptionFormData): Promise<void> {
    console.log('Submitting form data', data);
    if (data.currency === null) {
      notifications.show({
        title: 'Currency is required',
        message: 'Please select a currency for the subscription',
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
      imageUrl: data.imageUrl || undefined,
    };

    try {
      const newSubscription = await createSubscriptionMutation.mutateAsync({
        request,
      });
      notifications.show({
        title: 'Subscription created',
        message: `${newSubscription.name} has been created`,
        color: 'green',
      });
      navigate({
        to: '/subscriptions/$id',
        params: {
          id: newSubscription.id,
        },
      });
    } catch (error) {
      console.error('Error creating subscription', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create subscription',
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen>
      <form onSubmit={form.onSubmit(onFormSubmit)}>
        <Stack>
          <AppSection title="Create new subscription">
            <Stack>
              <TextInput
                required
                label="Name"
                placeholder="e.g., Netflix, Spotify, Gym membership"
                {...form.getInputProps('name')}
                error={form.errors.name}
              />
              <NativeSelect
                required
                rightSection={
                  <IconChevronDown
                    style={{ width: rem(16), height: rem(16) }}
                  />
                }
                label="Type"
                data={paymentTypes}
                {...form.getInputProps('type')}
                onChange={(event) => {
                  const type = event.currentTarget
                    .value as RecurringPaymentType;
                  form.setFieldValue('type', type);
                }}
              />
              <NativeSelect
                required
                rightSection={
                  <IconChevronDown
                    style={{ width: rem(16), height: rem(16) }}
                  />
                }
                label="Frequency"
                data={cadenceOptions}
                {...form.getInputProps('cadence')}
                onChange={(event) => {
                  const cadence = event.currentTarget
                    .value as RecurrenceCadence;
                  form.setFieldValue('cadence', cadence);
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
                label="Amount"
                required
                description="The recurring payment amount"
                {...form.getInputProps('amount')}
                leftSection={currency.symbol}
                decimalScale={currency.decimalPlaces ?? 2}
                min={0}
              />
              <TextInput
                label="Image URL (optional)"
                placeholder="https://example.com/logo.png"
                {...form.getInputProps('imageUrl')}
              />
            </Stack>
          </AppSection>
          <Group>
            <Button
              type="submit"
              loading={createSubscriptionMutation.isPending}
            >
              Create subscription
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate({ to: '/subscriptions' });
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
